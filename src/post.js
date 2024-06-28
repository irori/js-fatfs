{
	const define_wrapper = (rtype, name, argtypes) => {
		Module[name] = cwrap(name, rtype, argtypes);
	};
	const number = 'number';
	const string = 'string';
	const pointer = number;
	define_wrapper(number, 'f_open', [pointer, string, number]);
	define_wrapper(number, 'f_close', [pointer]);
	define_wrapper(number, 'f_read', [pointer, pointer, number, pointer]);
	define_wrapper(number, 'f_write', [pointer, pointer, number, pointer]);
	define_wrapper(number, 'f_lseek', [pointer, number]);
	define_wrapper(number, 'f_truncate', [pointer]);
	define_wrapper(number, 'f_sync', [pointer]);
	define_wrapper(number, 'f_opendir', [pointer, string]);
	define_wrapper(number, 'f_closedir', [pointer]);
	define_wrapper(number, 'f_readdir', [pointer, pointer]);
	define_wrapper(number, 'f_findfirst', [pointer, pointer, string, string]);
	define_wrapper(number, 'f_findnext', [pointer, pointer]);
	define_wrapper(number, 'f_mkdir', [string]);
	define_wrapper(number, 'f_unlink', [string]);
	define_wrapper(number, 'f_rename', [string, string]);
	define_wrapper(number, 'f_stat', [string, pointer]);
	define_wrapper(number, 'f_chmod', [string, number, number]);
	define_wrapper(number, 'f_utime', [string, pointer]);
	define_wrapper(number, 'f_chdir', [string]);
	define_wrapper(number, 'f_chdrive', [string]);
	define_wrapper(number, 'f_getcwd', [pointer, number]);
	define_wrapper(number, 'f_getfree', [string, pointer, pointer]);
	define_wrapper(number, 'f_getlabel', [string, pointer, pointer]);
	define_wrapper(number, 'f_setlabel', [string]);
	// FRESULT f_forward (FIL* fp, UINT(*func)(const BYTE*,UINT), UINT btf, UINT* bf);
	define_wrapper(number, 'f_expand', [pointer, number, number]);
	define_wrapper(number, 'f_mount', [pointer, string, number]);
	Module['f_mkfs'] = (path, opt, work, len) => {
		let stack;
		if (typeof opt === 'object') {
			stack = stackSave();
			const p_opt = stackAlloc(sizeof_MKFS_PARM);
			HEAPU8[p_opt + offsetof_MKFS_PARM_fmt] = opt.fmt;
			HEAPU8[p_opt + offsetof_MKFS_PARM_n_fat] = opt.n_fat;
			HEAPU32[(p_opt + offsetof_MKFS_PARM_align) >> 2] = opt.align;
			HEAPU32[(p_opt + offsetof_MKFS_PARM_n_root) >> 2] = opt.n_root;
			HEAPU32[(p_opt + offsetof_MKFS_PARM_au_size) >> 2] = opt.au_size;
			opt = p_opt;
		}
		const result = ccall('f_mkfs', number, [string, pointer, pointer, number], [path, opt, work, len]);
		if (stack) stackRestore(stack);
		return result;
	};
	define_wrapper(number, 'f_putc', [number, pointer]);
	define_wrapper(number, 'f_puts', [string, pointer]);
	// int f_printf (FIL* fp, const TCHAR* str, ...);
	define_wrapper(string, 'f_gets', [pointer, number, pointer]);

	Module['f_eof'] = Module['_f_eof_'];
	Module['f_error'] = Module['_f_error_'];
	Module['f_tell'] = (fp) => Module['_f_tell_'](fp) >>> 0;
	Module['f_size'] = (fp) => Module['_f_size_'](fp) >>> 0;
	Module['f_rewind'] = (fp) => Module['f_lseek'](fp, 0);
	Module['f_rewinddir'] = (dp) => Module['f_readdir'](dp, 0);
	Module['f_rmdir'] = Module['f_unlink'];
	Module['f_unmount'] = (path) => Module['f_mount'](0, path, 0);

	Module['FILINFO_fsize'] = (fno) => Module['_FILINFO_fsize'](fno) >>> 0;
	Module['FILINFO_fdate'] = Module['_FILINFO_fdate'];
	Module['FILINFO_ftime'] = Module['_FILINFO_ftime'];
	Module['FILINFO_fattrib'] = Module['_FILINFO_fattrib'];
	define_wrapper(string, 'FILINFO_fname', [pointer]);
	define_wrapper(string, 'FILINFO_altname', [pointer]);

	Module['malloc'] = Module['_malloc'];
	Module['free'] = Module['_free'];

	Module['onRuntimeInitialized'] = () => {
		if (Module['codepage']) {
			if (Module['_f_setcp'](Module['codepage']) !== FR_OK)
				abort(`invalid codepage ${Module['codepage']}`);
		}
	};
}
