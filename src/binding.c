#include <emscripten.h>
#include <stddef.h>
#include <time.h>
#include "ff.h"
#include "diskio.h"

EM_JS(DSTATUS, disk_initialize, (BYTE pdrv), {
	return Module.diskio.initialize(Module, pdrv);
});

EM_JS(DSTATUS, disk_status, (BYTE pdrv), {
	return Module.diskio.status(Module, pdrv);
});

EM_JS(DRESULT, disk_read, (BYTE pdrv, BYTE* buff, LBA_t sector, UINT count), {
	return Module.diskio.read(Module, pdrv, buff, sector, count);
});

EM_JS(DRESULT, disk_write, (BYTE pdrv, const BYTE* buff, LBA_t sector, UINT count), {
	return Module.diskio.write(Module, pdrv, buff, sector, count);
});

EM_JS(DRESULT, disk_ioctl, (BYTE pdrv, BYTE cmd, void* buff), {
	return Module.diskio.ioctl(Module, pdrv, cmd, buff);
});

// TODO: allow overriding this function
DWORD get_fattime(void)
{
	time_t t;
	struct tm *tm;
	time(&t);
	tm = localtime(&t);
	return (tm->tm_year - 80) << 25 |
		(tm->tm_mon + 1) << 21 |
		tm->tm_mday << 16 |
		tm->tm_hour << 11 |
		tm->tm_min << 5 |
		tm->tm_sec >> 1;
}

// Export FatFs APIs defined as macros
EMSCRIPTEN_KEEPALIVE int f_eof_(FIL* fp) { return f_eof(fp); }
EMSCRIPTEN_KEEPALIVE int f_error_(FIL* fp) { return f_error(fp); }
EMSCRIPTEN_KEEPALIVE FSIZE_t f_tell_(FIL* fp) { return f_tell(fp); }
EMSCRIPTEN_KEEPALIVE FSIZE_t f_size_(FIL* fp) { return f_size(fp); }

// FILINFO accessors
EMSCRIPTEN_KEEPALIVE FSIZE_t FILINFO_fsize(FILINFO* fno) { return fno->fsize; }
EMSCRIPTEN_KEEPALIVE WORD FILINFO_fdate(FILINFO* fno) { return fno->fdate; }
EMSCRIPTEN_KEEPALIVE WORD FILINFO_ftime(FILINFO* fno) { return fno->ftime; }
EMSCRIPTEN_KEEPALIVE BYTE FILINFO_fattrib(FILINFO* fno) { return fno->fattrib; }
#if FF_USE_LFN
EMSCRIPTEN_KEEPALIVE TCHAR* FILINFO_altname(FILINFO* fno) { return fno->altname; }
#endif
EMSCRIPTEN_KEEPALIVE TCHAR* FILINFO_fname(FILINFO* fno) { return fno->fname; }
