import assert from 'node:assert/strict';
import test from 'node:test';
import * as FatFs from '../dist/fatfs.js';

class MockDisk implements FatFs.DiskIO {
	readonly sectorSize = 512;
	buf = new Uint8Array(128*1024);

	initialize(ff: FatFs.FatFs, pdrv: number): number {
		return 0;
	}
	status(ff: FatFs.FatFs, pdrv: number): number {
		return 0;
	}
	read(ff: FatFs.FatFs, pdrv: number, buff: number, sector: number, count: number): number {
		ff.HEAPU8.set(new Uint8Array(this.buf.buffer, sector * this.sectorSize, count * this.sectorSize), buff);
		return FatFs.RES_OK;
	}
	write(ff: FatFs.FatFs, pdrv: number, buff: number, sector: number, count: number): number {
		this.buf.set(new Uint8Array(ff.HEAPU8.buffer, buff, count * this.sectorSize), sector * this.sectorSize);
		return FatFs.RES_OK;
	}
	ioctl(ff: FatFs.FatFs, pdrv: number, cmd: number, buff: number): number {
		switch (cmd) {
			case FatFs.CTRL_SYNC:
				return FatFs.RES_OK;
			case FatFs.GET_SECTOR_COUNT:
				ff.setValue(buff, this.buf.byteLength / this.sectorSize, 'i32');
				return FatFs.RES_OK;
			case FatFs.GET_SECTOR_SIZE:
				ff.setValue(buff, this.sectorSize, 'i16');
				return FatFs.RES_OK;
			case FatFs.GET_BLOCK_SIZE:
				ff.setValue(buff, 1, 'i32');
				return FatFs.RES_OK;
			default:
				console.warn(`ioctl(${cmd}): not implemented`);
				return FatFs.RES_ERROR;
		}
	}
}

function makeFileSystem(ff: FatFs.FatFs) {
	const work = ff.malloc(FatFs.FF_MAX_SS);
	assert.strictEqual(ff.f_mkfs('', 0, work, FatFs.FF_MAX_SS), FatFs.FR_OK);
	ff.free(work);
}

function mount(ff: FatFs.FatFs, path: string = '') {
	const fs = ff.malloc(FatFs.sizeof_FATFS);
	assert.strictEqual(ff.f_mount(fs, path, 1), FatFs.FR_OK);
}

function createFile(ff: FatFs.FatFs, path: string, contents?: Uint8Array) {
	const fp = ff.malloc(FatFs.sizeof_FIL);
	assert.strictEqual(ff.f_open(fp, path, FatFs.FA_WRITE | FatFs.FA_CREATE_NEW), FatFs.FR_OK);
	if (contents) {
		const buf = ff.malloc(contents.byteLength);
		ff.HEAPU8.set(contents, buf);
		const bw = ff.malloc(4);
		assert.strictEqual(ff.f_write(fp, buf, contents.byteLength, bw), FatFs.FR_OK);
		assert.strictEqual(ff.getValue(bw, 'i32'), contents.byteLength);
		ff.free(bw);
		ff.free(buf);
	}
	assert.strictEqual(ff.f_close(fp), FatFs.FR_OK);
	ff.free(fp);
}

function readFile(ff: FatFs.FatFs, path: string): Uint8Array {
	const fp = ff.malloc(FatFs.sizeof_FIL);
	assert.strictEqual(ff.f_open(fp, path, FatFs.FA_READ), FatFs.FR_OK);
	const size = ff.f_size(fp);
	const buf = ff.malloc(size);
	const br = ff.malloc(4);
	assert.strictEqual(ff.f_read(fp, buf, size, br), FatFs.FR_OK);
	assert.strictEqual(ff.getValue(br, 'i32'), size);
	ff.free(br);
	const result = ff.HEAPU8.slice(buf, buf + size);
	ff.free(buf);
	assert.strictEqual(ff.f_close(fp), FatFs.FR_OK);
	ff.free(fp);
	return result;
}

function readDir(ff: FatFs.FatFs, path: string): string[] {
	const dp = ff.malloc(FatFs.sizeof_DIR);
	const fno = ff.malloc(FatFs.sizeof_FILINFO);
	assert.strictEqual(ff.f_opendir(dp, path), FatFs.FR_OK);
	const result = [];
	while (true) {
		assert.strictEqual(ff.f_readdir(dp, fno), FatFs.FR_OK);
		const fname = ff.FILINFO_fname(fno);
		if (fname === '') break;
		result.push(fname);
	}
	ff.free(fno);
	assert.strictEqual(ff.f_closedir(dp), FatFs.FR_OK);
	ff.free(dp);
	return result;
}

test('f_mkfs', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
});

test('f_mkfs with options', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	const work = ff.malloc(FatFs.FF_MAX_SS);
	const opts = { fmt: FatFs.FM_FAT, n_fat: 1, align: 0, n_root: 0, au_size: 4096 };
	assert.strictEqual(ff.f_mkfs('', opts, work, FatFs.FF_MAX_SS), FatFs.FR_OK);
	ff.free(work);
});

test('f_mount', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
});

test('create file', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	createFile(ff, 'HELLO.TXT', new TextEncoder().encode('Hello, world!'));
});

test('read file', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	const text = 'Hello, world!';
	createFile(ff, 'HELLO.TXT', new TextEncoder().encode(text));
	const contents = readFile(ff, 'HELLO.TXT');
	assert.strictEqual(new TextDecoder().decode(contents), text);
});

test('read directory', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	createFile(ff, 'HELLO.TXT');
	assert.deepStrictEqual(readDir(ff, '/'), ['HELLO.TXT']);
});

test('create directory', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	assert.strictEqual(ff.f_mkdir('/SUB1'), FatFs.FR_OK);
	assert.strictEqual(ff.f_mkdir('/SUB1/SUB2'), FatFs.FR_OK);
	assert.deepStrictEqual(readDir(ff, '/'), ['SUB1']);
	assert.deepStrictEqual(readDir(ff, '/SUB1'), ['SUB2']);
	assert.deepStrictEqual(readDir(ff, '/SUB1/SUB2'), []);
});

test('non-ASCII long filename', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk(), codepage: 932 });
	makeFileSystem(ff);
	mount(ff);
	createFile(ff, 'こんにちは.txt');
	const fno = ff.malloc(FatFs.sizeof_FILINFO);
	assert.strictEqual(ff.f_stat('こんにちは.txt', fno), FatFs.FR_OK);
	assert.strictEqual(ff.FILINFO_altname(fno), 'こんに~1.TXT');
	ff.free(fno);
});

test('multiple drives', async () => {
	const ff = await FatFs.create({ diskio: new MockDisk() });
	makeFileSystem(ff);
	mount(ff, '0:');
	mount(ff, '9:');
	assert.strictEqual(ff.f_unmount('0:'), FatFs.FR_OK);
	assert.strictEqual(ff.f_unmount('9:'), FatFs.FR_OK);
});
