#include <stddef.h>
#include "ff.h"
#include "diskio.h"

#define IMPORT(name) __attribute__((import_module("env"), import_name(#name)))

IMPORT(disk_initialize) DSTATUS disk_initialize(BYTE pdrv);
IMPORT(disk_status) DSTATUS disk_status(BYTE pdrv);
IMPORT(disk_read) DRESULT disk_read(BYTE pdrv, BYTE* buff, LBA_t sector, UINT count);
IMPORT(disk_write) DRESULT disk_write(BYTE pdrv, const BYTE* buff, LBA_t sector, UINT count);
IMPORT(disk_ioctl) DRESULT disk_ioctl(BYTE pdrv, BYTE cmd, void* buff);
IMPORT(js_get_fattime) DWORD js_get_fattime(void);

DWORD get_fattime(void)
{
	return js_get_fattime();
}

// Export FatFs APIs defined as macros.
int f_eof_(FIL* fp) { return f_eof(fp); }
int f_error_(FIL* fp) { return f_error(fp); }
FSIZE_t f_tell_(FIL* fp) { return f_tell(fp); }
FSIZE_t f_size_(FIL* fp) { return f_size(fp); }

// FILINFO accessors.
FSIZE_t FILINFO_fsize(FILINFO* fno) { return fno->fsize; }
WORD FILINFO_fdate(FILINFO* fno) { return fno->fdate; }
WORD FILINFO_ftime(FILINFO* fno) { return fno->ftime; }
BYTE FILINFO_fattrib(FILINFO* fno) { return fno->fattrib; }
#if FF_USE_LFN
TCHAR* FILINFO_altname(FILINFO* fno) { return fno->altname; }
#endif
TCHAR* FILINFO_fname(FILINFO* fno) { return fno->fname; }
