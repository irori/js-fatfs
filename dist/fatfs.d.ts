type pointer = number;
type CType = 'i8' | 'i16' | 'i32' | 'i64' | 'float' | 'double' | '*';

export interface FatFs {
	f_open: (fp: pointer, path: string, mode: number) => number;
	f_close: (fp: pointer) => number;
	f_read: (fp: pointer, buff: pointer, btr: number, br: pointer) => number;
	f_write: (fp: pointer, buff: pointer, btw: number, bw: pointer) => number;
	f_lseek: (fp: pointer, ofs: number) => number;
	f_truncate: (fp: pointer) => number;
	f_sync: (fp: pointer) => number;
	f_opendir: (dp: pointer, path: string) => number;
	f_closedir: (dp: pointer) => number;
	f_readdir: (dp: pointer, fno: pointer) => number;
	f_findfirst: (dp: pointer, fno: pointer, path: string, pattern: string) => number;
	f_findnext: (dp: pointer, fno: pointer) => number;
	f_mkdir: (path: string) => number;
	f_unlink: (path: string) => number;
	f_rename: (old_name: string, new_name: string) => number;
	f_stat: (path: string, fno: pointer) => number;
	f_chmod: (path: string, attr: number, mask: number) => number;
	f_utime: (path: string, fno: pointer) => number;
	f_chdir: (path: string) => number;
	f_chdrive: (path: string) => number;
	f_getcwd: (buff: pointer, len: number) => number;
	f_getfree: (path: string, nclst: pointer, fatfs: pointer) => number;
	f_getlabel: (path: string, label: pointer, vsn: pointer) => number;
	f_setlabel: (label: string) => number;
	// FRESULT f_forward (FIL* fp, UINT(*func)(const BYTE*,UINT), UINT btf, UINT* bf);
	f_expand: (fp: pointer, fsz: number, opt: number) => number;
	f_mount: (fs: pointer, path: string, opt: number) => number;
	f_mkfs: (path: string, opt: pointer, work: pointer, len: number) => number;
	f_setcp: (cp: number) => number;
	f_putc: (chr: number, fp: pointer) => number;
	f_puts: (str: string, fp: pointer) => number;
	// int f_printf (FIL* fp, const TCHAR* str, ...);
	f_gets: (buff: pointer, len: number, fp: pointer) => string;

	f_eof: (fp: pointer) => number;
	f_error: (fp: pointer) => number;
	f_tell: (fp: pointer) => number;
	f_size: (fp: pointer) => number;
	f_rewind: (fp: pointer) => number;
	f_rewinddir: (dp: pointer) => number;
	f_rmdir: (path: string) => number;
	f_unmount: (path: string) => number;

	FILINFO_fsize: (fno: pointer) => number;
	FILINFO_fdate: (fno: pointer) => number;
	FILINFO_ftime: (fno: pointer) => number;
	FILINFO_fattrib: (fno: pointer) => number;
	FILINFO_fname: (fno: pointer) => string;
	FILINFO_altname: (fno: pointer) => string;

	malloc: (size: number) => pointer;
	free: (ptr: pointer) => void;

	FF_MAX_SS: number;
	sizeof_FATFS: number;
	sizeof_FIL: number;
	sizeof_DIR: number;
	sizeof_FILINFO: number;
	FR_OK: number;
	FR_DISK_ERR: number;
	FR_INT_ERR: number;
	FR_NOT_READY: number;
	FR_NO_FILE: number;
	FR_NO_PATH: number;
	FR_INVALID_NAME: number;
	FR_DENIED: number;
	FR_EXIST: number;
	FR_INVALID_OBJECT: number;
	FR_WRITE_PROTECTED: number;
	FR_INVALID_DRIVE: number;
	FR_NOT_ENABLED: number;
	FR_NO_FILESYSTEM: number;
	FR_MKFS_ABORTED: number;
	FR_TIMEOUT: number;
	FR_LOCKED: number;
	FR_NOT_ENOUGH_CORE: number;
	FR_TOO_MANY_OPEN_FILES: number;
	FR_INVALID_PARAMETER: number;
	FA_READ: number;
	FA_WRITE: number;
	FA_OPEN_EXISTING: number;
	FA_CREATE_NEW: number;
	FA_CREATE_ALWAYS: number;
	FA_OPEN_ALWAYS: number;
	FA_OPEN_APPEND: number;
	CREATE_LINKMAP: number;
	FM_FAT: number;
	FM_FAT32: number;
	FM_EXFAT: number;
	FM_ANY: number;
	FM_SFD: number;
	FS_FAT12: number;
	FS_FAT16: number;
	FS_FAT32: number;
	FS_EXFAT: number;
	AM_RDO: number;
	AM_HID: number;
	AM_SYS: number;
	AM_DIR: number;
	AM_ARC: number;
	RES_OK: number;
	RES_ERROR: number;
	RES_WRPRT: number;
	RES_NOTRDY: number;
	RES_PARERR: number;
	STA_NOINIT: number;
	STA_NODISK: number;
	STA_PROTECT: number;
	CTRL_SYNC: number;
	GET_SECTOR_COUNT: number;
	GET_SECTOR_SIZE: number;
	GET_BLOCK_SIZE: number;
	CTRL_TRIM: number;
	CTRL_POWER: number;
	CTRL_LOCK: number;
	CTRL_EJECT: number;
	CTRL_FORMAT: number;
	MMC_GET_TYPE: number;
	MMC_GET_CSD: number;
	MMC_GET_CID: number;
	MMC_GET_OCR: number;
	MMC_GET_SDSTAT: number;
	ISDIO_READ: number;
	ISDIO_WRITE: number;
	ISDIO_MRITE: number;
	ATA_GET_REV: number;
	ATA_GET_MODEL: number;
	ATA_GET_SN: number;

	HEAPU8: Uint8Array;
	setValue: (ptr: number, value: any, type: CType) => void;
	getValue: (ptr: number, type: CType) => number;
}

export interface DiskIO {
	initialize: (ff: FatFs, pdrv: number) => number;
	status: (ff: FatFs, pdrv: number) => number;
	read: (ff: FatFs, pdrv: number, buff: pointer, sector: number, count: number) => number;
	write: (ff: FatFs, pdrv: number, buff: pointer, sector: number, count: number) => number;
	ioctl: (ff: FatFs, pdrv: number, cmd: number, buff: pointer) => number;
}

interface FatFsOptions {
	disk_ops: DiskIO;
}

declare function createFatFs(opts: FatFsOptions): Promise<FatFs>;
export default createFatFs;
