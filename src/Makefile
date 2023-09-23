EMFLAGS = \
	-s ENVIRONMENT=web,node \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s STACK_SIZE=8192 \
	-s INITIAL_MEMORY=1048576 \
	-s MALLOC=emmalloc \
	-s MODULARIZE \
	-s EXPORT_ES6 \
	-s EXPORTED_RUNTIME_METHODS=cwrap,getValue,setValue \
	-s EXPORTED_FUNCTIONS=_malloc,_free \

FATFS = ../fatfs/source
SRCS = binding.c $(FATFS)/ff.c $(FATFS)/ffunicode.c

../dist/fatfs.js: $(SRCS) $(FATFS)/ffconf.h Makefile post.js constants.js
	emcc -Oz --post-js=post.js --extern-post-js=constants.js -I$(FATFS) $(EMFLAGS) -o $@ $(SRCS)

constants.js: gen_constants.c $(FATFS)/ffconf.h
	emcc -s ENVIRONMENT=node -I$(FATFS) gen_constants.c -o gen_constants.js
	$(EMSDK_NODE) gen_constants.js >constants.js

clean:
	rm -f constants.js gen_constants.js gen_constants.wasm ../dist/fatfs.js ../dist/fatfs.wasm

.PHONY: clean
