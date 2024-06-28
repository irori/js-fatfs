# Changelog

## 0.2.1 - 2024-06-28
- Fixed a bug where `f_tell()`, `f_size()` and `FILINFO_fsize()` returned
  negative values when the file size exceeded 2 GiB. (#4)

## 0.2.0 - 2024-06-21
- `f_mkfs()` now accepts `opt` parameter as a JS object. (#3)

## 0.1.1 - 2024-06-13
- Set `type=module` in package.json for some bundlers. (#2)

## 0.1.0 - 2023-10-09
- Enabled multiple volumes (up to 10 logical drives).
- Removed `f_setcp()` function. Codepage is now set in `FatFs.create()`.

## 0.0.0 - 2023-09-24
- Initial release.
