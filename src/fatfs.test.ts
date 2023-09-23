import * as FatFs from '../dist/fatfs.js';
import { expect, test } from "bun:test";

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
	expect(ff.f_mkfs('', 0, work, FatFs.FF_MAX_SS)).toBe(FatFs.FR_OK);
	ff.free(work);
}

function mount(ff: FatFs.FatFs) {
	const fs = ff.malloc(FatFs.sizeof_FATFS);
	expect(ff.f_mount(fs, '', 1)).toBe(FatFs.FR_OK);
}

function createFile(ff: FatFs.FatFs, path: string, contents?: Uint8Array) {
	const fp = ff.malloc(FatFs.sizeof_FIL);
	expect(ff.f_open(fp, path, FatFs.FA_WRITE | FatFs.FA_CREATE_NEW)).toBe(FatFs.FR_OK);
	if (contents) {
		const buf = ff.malloc(contents.byteLength);
		ff.HEAPU8.set(contents, buf);
		const bw = ff.malloc(4);
		expect(ff.f_write(fp, buf, contents.byteLength, bw)).toBe(FatFs.FR_OK);
		expect(ff.getValue(bw, 'i32')).toBe(contents.byteLength);
		ff.free(bw);
		ff.free(buf);
	}
	expect(ff.f_close(fp)).toBe(FatFs.FR_OK);
	ff.free(fp);
}

function readFile(ff: FatFs.FatFs, path: string): Uint8Array {
	const fp = ff.malloc(FatFs.sizeof_FIL);
	expect(ff.f_open(fp, path, FatFs.FA_READ)).toBe(FatFs.FR_OK);
	const size = ff.f_size(fp);
	const buf = ff.malloc(size);
	const br = ff.malloc(4);
	expect(ff.f_read(fp, buf, size, br)).toBe(FatFs.FR_OK);
	expect(ff.getValue(br, 'i32')).toBe(size);
	ff.free(br);
	const result = ff.HEAPU8.slice(buf, buf + size);
	ff.free(buf);
	expect(ff.f_close(fp)).toBe(FatFs.FR_OK);
	ff.free(fp);
	return result;
}

function readDir(ff: FatFs.FatFs, path: string): string[] {
	const dp = ff.malloc(FatFs.sizeof_DIR);
	const fno = ff.malloc(FatFs.sizeof_FILINFO);
	expect(ff.f_opendir(dp, path)).toBe(FatFs.FR_OK);
	const result = [];
	while (true) {
		expect(ff.f_readdir(dp, fno)).toBe(FatFs.FR_OK);
		const fname = ff.FILINFO_fname(fno);
		if (fname === '') break;
		result.push(fname);
	}
	ff.free(fno);
	expect(ff.f_closedir(dp)).toBe(FatFs.FR_OK);
	ff.free(dp);
	return result;
}

test('f_mkfs', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	makeFileSystem(ff);
});

test('f_mount', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
});

test('create file', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	createFile(ff, 'HELLO.TXT', new TextEncoder().encode('Hello, world!'));
});

test('read file', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	const text = 'Hello, world!';
	createFile(ff, 'HELLO.TXT', new TextEncoder().encode(text));
	const contents = readFile(ff, 'HELLO.TXT');
	expect(new TextDecoder().decode(contents)).toBe(text);
});

test('read directory', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	createFile(ff, 'HELLO.TXT');
	expect(readDir(ff, '/')).toEqual(['HELLO.TXT']);
});

test('create directory', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	makeFileSystem(ff);
	mount(ff);
	expect(ff.f_mkdir('/SUB1')).toBe(FatFs.FR_OK);
	expect(ff.f_mkdir('/SUB1/SUB2')).toBe(FatFs.FR_OK);
	expect(readDir(ff, '/')).toEqual(['SUB1']);
	expect(readDir(ff, '/SUB1')).toEqual(['SUB2']);
	expect(readDir(ff, '/SUB1/SUB2')).toEqual([]);
});

test('Non-ASCII long filename', async () => {
	const ff = await FatFs.create({ disk_ops: new MockDisk() });
	expect(ff.f_setcp(932)).toBe(FatFs.FR_OK);
	makeFileSystem(ff);
	mount(ff);
	createFile(ff, 'こんにちは.txt');
	const fno = ff.malloc(FatFs.sizeof_FILINFO);
	expect(ff.f_stat('こんにちは.txt', fno)).toBe(FatFs.FR_OK);
	expect(ff.FILINFO_altname(fno)).toBe('こんに~1.TXT');
	ff.free(fno);
});
