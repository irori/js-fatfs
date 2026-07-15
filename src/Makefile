CC = clang
NODE ?= node

FATFS = ../fatfs/source
SRCS = binding.c runtime.c gen_constants.c $(FATFS)/ff.c $(FATFS)/ffunicode.c
CFLAGS = --target=wasm32 -std=c11 -Oz -flto -ffreestanding -fno-builtin -nostdlib \
	-Iinclude -I$(FATFS)
LDFLAGS = -Wl,--no-entry,--export-all,--export-memory,--allow-undefined-file=imports.txt \
	-Wl,--initial-memory=1048576,--max-memory=2147483648,-z,stack-size=8192

all: ../dist/fatfs.js ../dist/fatfs.wasm

../dist/fatfs.wasm: $(SRCS) $(FATFS)/ffconf.h Makefile imports.txt
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $(SRCS)

../dist/fatfs.js: ../dist/fatfs.wasm post.js gen_module.js
	$(NODE) gen_module.js ../dist/fatfs.wasm post.js $@

clean:
	rm -f ../dist/fatfs.js ../dist/fatfs.wasm

.PHONY: all clean
