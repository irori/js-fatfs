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
	f_mkfs: (path: string, opt: pointer | MkfsParams, work: pointer, len: number) => number;
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

export type FatFsOptions = {
	diskio: DiskIO;
	codepage?: number;  // corresponds to the f_setcp() function of FatFs
}

export type MkfsParams = {
	fmt: number;
	n_fat: number;
	align: number;
	n_root: number;
	au_size: number;
}

export declare function create(opts: FatFsOptions): Promise<FatFs>;
export default create;

export declare const FF_MAX_SS: number;
export declare const sizeof_FATFS: number;
export declare const sizeof_FIL: number;
export declare const sizeof_DIR: number;
export declare const sizeof_FILINFO: number;
export declare const sizeof_MKFS_PARM: number;
export declare const offsetof_MKFS_PARM_fmt: number;
export declare const offsetof_MKFS_PARM_n_fat: number;
export declare const offsetof_MKFS_PARM_align: number;
export declare const offsetof_MKFS_PARM_n_root: number;
export declare const offsetof_MKFS_PARM_au_size: number;
export declare const FR_OK: number;
export declare const FR_DISK_ERR: number;
export declare const FR_INT_ERR: number;
export declare const FR_NOT_READY: number;
export declare const FR_NO_FILE: number;
export declare const FR_NO_PATH: number;
export declare const FR_INVALID_NAME: number;
export declare const FR_DENIED: number;
export declare const FR_EXIST: number;
export declare const FR_INVALID_OBJECT: number;
export declare const FR_WRITE_PROTECTED: number;
export declare const FR_INVALID_DRIVE: number;
export declare const FR_NOT_ENABLED: number;
export declare const FR_NO_FILESYSTEM: number;
export declare const FR_MKFS_ABORTED: number;
export declare const FR_TIMEOUT: number;
export declare const FR_LOCKED: number;
export declare const FR_NOT_ENOUGH_CORE: number;
export declare const FR_TOO_MANY_OPEN_FILES: number;
export declare const FR_INVALID_PARAMETER: number;
export declare const FA_READ: number;
export declare const FA_WRITE: number;
export declare const FA_OPEN_EXISTING: number;
export declare const FA_CREATE_NEW: number;
export declare const FA_CREATE_ALWAYS: number;
export declare const FA_OPEN_ALWAYS: number;
export declare const FA_OPEN_APPEND: number;
export declare const CREATE_LINKMAP: number;
export declare const FM_FAT: number;
export declare const FM_FAT32: number;
export declare const FM_EXFAT: number;
export declare const FM_ANY: number;
export declare const FM_SFD: number;
export declare const FS_FAT12: number;
export declare const FS_FAT16: number;
export declare const FS_FAT32: number;
export declare const FS_EXFAT: number;
export declare const AM_RDO: number;
export declare const AM_HID: number;
export declare const AM_SYS: number;
export declare const AM_DIR: number;
export declare const AM_ARC: number;
export declare const RES_OK: number;
export declare const RES_ERROR: number;
export declare const RES_WRPRT: number;
export declare const RES_NOTRDY: number;
export declare const RES_PARERR: number;
export declare const STA_NOINIT: number;
export declare const STA_NODISK: number;
export declare const STA_PROTECT: number;
export declare const CTRL_SYNC: number;
export declare const GET_SECTOR_COUNT: number;
export declare const GET_SECTOR_SIZE: number;
export declare const GET_BLOCK_SIZE: number;
export declare const CTRL_TRIM: number;
export declare const CTRL_POWER: number;
export declare const CTRL_LOCK: number;
export declare const CTRL_EJECT: number;
export declare const CTRL_FORMAT: number;
export declare const MMC_GET_TYPE: number;
export declare const MMC_GET_CSD: number;
export declare const MMC_GET_CID: number;
export declare const MMC_GET_OCR: number;
export declare const MMC_GET_SDSTAT: number;
export declare const ISDIO_READ: number;
export declare const ISDIO_WRITE: number;
export declare const ISDIO_MRITE: number;
export declare const ATA_GET_REV: number;
export declare const ATA_GET_MODEL: number;
export declare const ATA_GET_SN: number;
