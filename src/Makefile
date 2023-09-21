EMFLAGS = \
	-s ENVIRONMENT=web,node \
	-s MODULARIZE \
	-s EXPORT_ES6 \
	-s EXPORTED_RUNTIME_METHODS=cwrap,getValue,setValue \
	-s EXPORTED_FUNCTIONS=_main,_malloc,_free \

FATFS = ../fatfs/source
SRCS = binding.c $(FATFS)/ff.c

../dist/fatfs.js: $(SRCS) $(FATFS)/ffconf.h Makefile post.js
	emcc -Oz --post-js=post.js -I$(FATFS) $(EMFLAGS) -o $@ $(SRCS)
