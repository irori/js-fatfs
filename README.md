# js-fatfs

This library provides JavaScript/TypeScript bindings for ChaN's
[FatFs](http://elm-chan.org/fsw/ff/) library.

## Installation
```sh
npm install js-fatfs
```

## Usage
There is no API reference yet. Please refer to the [TypeScript definition
file](dist/fatfs.d.ts), [tests](src/fatfs.test.ts) and [FatFs
manual](http://elm-chan.org/fsw/ff/) for usage.

## Example

The program reads a raw disk image (e.g. floppy disk image) and displays the
names and sizes of the files in the root directory.

```typescript
import * as FatFs from 'js-fatfs';
import * as fs from 'fs';

// The FatFs.DiskIO interface is a set of callbacks provided to FatFs. This
// class implements storage controls for a raw disk image.
class RawDiskImage implements FatFs.DiskIO {
  private sectorSize: number;

  constructor(private image: Buffer) {
    this.sectorSize = image.readUInt16LE(11);  // BPB_BytsPerSec
  }
  // http://elm-chan.org/fsw/ff/doc/dinit.html
  initialize(ff: FatFs.FatFs, pdrv: number) {
    return 0;
  }
  // http://elm-chan.org/fsw/ff/doc/dstat.html
  status(ff: FatFs.FatFs, pdrv: number) {
    return 0;
  }
  // http://elm-chan.org/fsw/ff/doc/dread.html
  read(ff: FatFs.FatFs, pdrv: number, buff: number, sector: number, count: number) {
    const data = this.image.subarray(sector * this.sectorSize, (sector + count) * this.sectorSize);
    // Write the read data to the area starting from `buff` in the FatFs memory.
    ff.HEAPU8.set(data, buff);
    return FatFs.RES_OK;
  }
  // http://elm-chan.org/fsw/ff/doc/dwrite.html
  write(ff: FatFs.FatFs, pdrv: number, buff: number, sector: number, count: number) {
    // The data to be written is in the area starting from `buff` in the FatFs memory.
    const data = ff.HEAPU8.subarray(buff, buff + count * this.sectorSize);
    this.image.set(data, sector * this.sectorSize);
    return FatFs.RES_OK;
  }
  // http://elm-chan.org/fsw/ff/doc/dioctl.html
  ioctl(ff: FatFs.FatFs, pdrv: number, cmd: number, buff: number) {
    switch (cmd) {
      case FatFs.CTRL_SYNC:
        return FatFs.RES_OK;
      case FatFs.GET_SECTOR_COUNT:
        // Use `ff.setValue` to write an integer to the FatFs memory.
        ff.setValue(buff, this.image.byteLength / this.sectorSize, 'i32');
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

function check_result(r: number) {
  if (r !== FatFs.FR_OK) throw new Error(`FatFs error: ${r}`);
}

// Create a FatFs instance, by providing a DiskIO implementation.
// Note the `await` because `FatFs.create()` returns a promise.
const ff = await FatFs.create({
  diskio: new RawDiskImage(fs.readFileSync(process.argv[2]))
});

// Mount the filesystem.
// Since this library is a thin wrapper around FatFs, memory management is explicit.
const fatfs = ff.malloc(FatFs.sizeof_FATFS);
check_result(ff.f_mount(fatfs, '', 1));

// Open the root directory.
const dir = ff.malloc(FatFs.sizeof_DIR);
const filinfo = ff.malloc(FatFs.sizeof_FILINFO);
check_result(ff.f_opendir(dir, '/'));

// Iterate through the directory and display the names and sizes of entries.
while (true) {
  check_result(ff.f_readdir(dir, filinfo));
  const fname = ff.FILINFO_fname(filinfo);
  if (fname === '') break;
  console.log([fname, ff.FILINFO_fsize(filinfo)]);
}

// Clean up.
ff.free(filinfo);
check_result(ff.f_closedir(dir));
ff.free(dir);
check_result(ff.f_unmount(''));
ff.free(fatfs);
```

## License
This JavaScript binding is licensed under the [BSD 1-Clause License](LICENSE).

FatFs is licensed under the [FatFs License](fatfs/LICENSE.txt), which is very
similar to the BSD 1-Clause License.
