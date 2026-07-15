const wasmUrl = new URL('./fatfs.wasm', import.meta.url);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function loadWasm() {
	if (wasmUrl.protocol === 'file:') {
		const { readFile } = await import('node:fs/promises');
		return readFile(wasmUrl);
	}
	const response = await fetch(wasmUrl);
	if (!response.ok) throw new Error(`Unable to load ${wasmUrl}: ${response.status}`);
	return response.arrayBuffer();
}

export async function create(options) {
	if (!options?.diskio) throw new TypeError('diskio is required');
	let ff;
	const diskio = options.diskio;
	const env = {
		disk_initialize: (pdrv) => diskio.initialize(ff, pdrv),
		disk_status: (pdrv) => diskio.status(ff, pdrv),
		disk_read: (pdrv, buff, sector, count) => diskio.read(ff, pdrv, buff, sector, count),
		disk_write: (pdrv, buff, sector, count) => diskio.write(ff, pdrv, buff, sector, count),
		disk_ioctl: (pdrv, cmd, buff) => diskio.ioctl(ff, pdrv, cmd, buff),
		// TODO: allow overriding this function through create options.
		js_get_fattime: () => {
			const now = new Date();
			return ((now.getFullYear() - 1980) << 25) |
				((now.getMonth() + 1) << 21) |
				(now.getDate() << 16) |
				(now.getHours() << 11) |
				(now.getMinutes() << 5) |
				(now.getSeconds() >> 1);
		},
	};
	const module = await WebAssembly.compile(await loadWasm());
	const instance = await WebAssembly.instantiate(module, { env });
	const wasm = instance.exports;

	const heap = () => new Uint8Array(wasm.memory.buffer);
	const view = () => new DataView(wasm.memory.buffer);
	const malloc = (size) => wasm.malloc(size);
	const free = (ptr) => wasm.free(ptr);
	const encode = (value) => {
		const bytes = encoder.encode(value);
		const ptr = malloc(bytes.length + 1);
		if (!ptr) throw new Error('FatFs WebAssembly memory exhausted');
		heap().set(bytes, ptr);
		heap()[ptr + bytes.length] = 0;
		return ptr;
	};
	const decode = (ptr) => {
		if (!ptr) return null;
		const bytes = heap();
		let end = ptr;
		while (bytes[end]) end++;
		return decoder.decode(bytes.subarray(ptr, end));
	};
	const call = (name, args, strings = []) => {
		const allocated = [];
		try {
			for (const index of strings) {
				const ptr = encode(args[index]);
				allocated.push(ptr);
				args[index] = ptr;
			}
			return wasm[name](...args);
		} finally {
			for (const ptr of allocated) free(ptr);
		}
	};
	const wrap = (name, strings = []) => (...args) => call(name, args, strings);

	ff = {
		f_open: wrap('f_open', [1]),
		f_close: wrap('f_close'),
		f_read: wrap('f_read'),
		f_write: wrap('f_write'),
		f_lseek: wrap('f_lseek'),
		f_truncate: wrap('f_truncate'),
		f_sync: wrap('f_sync'),
		f_opendir: wrap('f_opendir', [1]),
		f_closedir: wrap('f_closedir'),
		f_readdir: wrap('f_readdir'),
		f_findfirst: wrap('f_findfirst', [2, 3]),
		f_findnext: wrap('f_findnext'),
		f_mkdir: wrap('f_mkdir', [0]),
		f_unlink: wrap('f_unlink', [0]),
		f_rename: wrap('f_rename', [0, 1]),
		f_stat: wrap('f_stat', [0]),
		f_chmod: wrap('f_chmod', [0]),
		f_utime: wrap('f_utime', [0]),
		f_chdir: wrap('f_chdir', [0]),
		f_chdrive: wrap('f_chdrive', [0]),
		f_getcwd: wrap('f_getcwd'),
		f_getfree: wrap('f_getfree', [0]),
		f_getlabel: wrap('f_getlabel', [0]),
		f_setlabel: wrap('f_setlabel', [0]),
		// FRESULT f_forward (FIL* fp, UINT(*func)(const BYTE*,UINT), UINT btf, UINT* bf);
		f_expand: wrap('f_expand'),
		f_mount: wrap('f_mount', [1]),
		f_putc: wrap('f_putc'),
		f_puts: wrap('f_puts', [0]),
		// int f_printf (FIL* fp, const TCHAR* str, ...);
		f_gets: (buff, len, fp) => decode(wasm.f_gets(buff, len, fp)),

		f_eof: wrap('f_eof_'),
		f_error: wrap('f_error_'),
		f_tell: (fp) => wasm.f_tell_(fp) >>> 0,
		f_size: (fp) => wasm.f_size_(fp) >>> 0,

		FILINFO_fsize: (fno) => wasm.FILINFO_fsize(fno) >>> 0,
		FILINFO_fdate: wrap('FILINFO_fdate'),
		FILINFO_ftime: wrap('FILINFO_ftime'),
		FILINFO_fattrib: wrap('FILINFO_fattrib'),
		FILINFO_fname: (fno) => decode(wasm.FILINFO_fname(fno)),
		FILINFO_altname: (fno) => decode(wasm.FILINFO_altname(fno)),

		malloc,
		free,
		setValue(ptr, value, type) {
			const data = view();
			switch (type) {
				case 'i8': data.setInt8(ptr, value); break;
				case 'i16': data.setInt16(ptr, value, true); break;
				case 'i32': case '*': data.setInt32(ptr, value, true); break;
				case 'i64': data.setBigInt64(ptr, BigInt(value), true); break;
				case 'float': data.setFloat32(ptr, value, true); break;
				case 'double': data.setFloat64(ptr, value, true); break;
				default: throw new TypeError(`Unsupported C type: ${type}`);
			}
		},
		getValue(ptr, type) {
			const data = view();
			switch (type) {
				case 'i8': return data.getInt8(ptr);
				case 'i16': return data.getInt16(ptr, true);
				case 'i32': case '*': return data.getInt32(ptr, true);
				case 'i64': return Number(data.getBigInt64(ptr, true));
				case 'float': return data.getFloat32(ptr, true);
				case 'double': return data.getFloat64(ptr, true);
				default: throw new TypeError(`Unsupported C type: ${type}`);
			}
		},
	};
	Object.defineProperty(ff, 'HEAPU8', { get: heap });
	ff.f_mkfs = (path, opt, work, len) => {
		let optPtr = opt;
		if (typeof opt === 'object' && opt !== null) {
			optPtr = malloc(sizeof_MKFS_PARM);
			if (!optPtr) throw new Error('FatFs WebAssembly memory exhausted');
			const data = view();
			data.setUint8(optPtr + offsetof_MKFS_PARM_fmt, opt.fmt);
			data.setUint8(optPtr + offsetof_MKFS_PARM_n_fat, opt.n_fat);
			data.setUint32(optPtr + offsetof_MKFS_PARM_align, opt.align, true);
			data.setUint32(optPtr + offsetof_MKFS_PARM_n_root, opt.n_root, true);
			data.setUint32(optPtr + offsetof_MKFS_PARM_au_size, opt.au_size, true);
		}
		try {
			return call('f_mkfs', [path, optPtr, work, len], [0]);
		} finally {
			if (optPtr !== opt) free(optPtr);
		}
	};
	ff.f_rewind = (fp) => ff.f_lseek(fp, 0);
	ff.f_rewinddir = (dp) => ff.f_readdir(dp, 0);
	ff.f_rmdir = ff.f_unlink;
	ff.f_unmount = (path) => ff.f_mount(0, path, 0);

	if (options.codepage && wasm.f_setcp(options.codepage) !== FR_OK)
		throw new Error(`invalid codepage ${options.codepage}`);
	return ff;
}

export default create;
