EMFLAGS = \
	-s ENVIRONMENT=web,node \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s STACK_SIZE=8192 \
	-s INITIAL_MEMORY=1048576 \
	-s MALLOC=emmalloc \
	-s MODULARIZE \
	-s EXPORT_ES6 \
	-s EXPORTED_RUNTIME_METHODS=getValue,setValue \
	-s EXPORTED_FUNCTIONS=_malloc,_free \
	-s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='$$cwrap,$$ccall,$$stackSave,$$stackAlloc,$$stackRestore' \

FATFS = ../fatfs/source
SRCS = binding.c $(FATFS)/ff.c $(FATFS)/ffunicode.c

../dist/fatfs.js: $(SRCS) $(FATFS)/ffconf.h Makefile post.js constants.js
	emcc -Oz --post-js=post.js --extern-post-js=constants.js -I$(FATFS) $(EMFLAGS) -o $@ $(SRCS)

constants.js: gen_constants.c $(FATFS)/ffconf.h
	emcc -s ENVIRONMENT=node -I$(FATFS) gen_constants.c -o gen_constants.cjs
	$(EMSDK_NODE) gen_constants.cjs >constants.js

clean:
	rm -f constants.js gen_constants.cjs gen_constants.wasm ../dist/fatfs.js ../dist/fatfs.wasm

.PHONY: clean
