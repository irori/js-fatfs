{
	const define_wrapper = (rtype, name, argtypes) => {
		Module[name] = Module.cwrap(name, rtype, argtypes);
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
	define_wrapper(number, 'f_mkfs', [string, pointer, pointer, number]);
	define_wrapper(number, 'f_setcp', [number]);
	define_wrapper(number, 'f_putc', [number, pointer]);
	define_wrapper(number, 'f_puts', [string, pointer]);
	// int f_printf (FIL* fp, const TCHAR* str, ...);
	define_wrapper(string, 'f_gets', [pointer, number, pointer]);

	Module['f_eof'] = Module['_f_eof_'];
	Module['f_error'] = Module['_f_error_'];
	Module['f_tell'] = Module['_f_tell_'];
	Module['f_size'] = Module['_f_size_'];
	Module['f_rewind'] = (fp) => Module['f_lseek'](fp, 0);
	Module['f_rewinddir'] = (dp) => Module['f_readdir'](dp, 0);
	Module['f_rmdir'] = Module['f_unlink'];
	Module['f_unmount'] = (path) => Module['f_mount'](0, path, 0);

	Module['FILINFO_fsize'] = Module['_FILINFO_fsize'];
	Module['FILINFO_fdate'] = Module['_FILINFO_fdate'];
	Module['FILINFO_ftime'] = Module['_FILINFO_ftime'];
	Module['FILINFO_fattrib'] = Module['_FILINFO_fattrib'];
	define_wrapper(string, 'FILINFO_fname', [pointer]);
	define_wrapper(string, 'FILINFO_altname', [pointer]);

	Module['malloc'] = Module['_malloc'];
	Module['free'] = Module['_free'];
}
