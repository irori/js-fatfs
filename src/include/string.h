#ifndef JS_FATFS_STRING_H
#define JS_FATFS_STRING_H

#include <stddef.h>

void *memcpy(void *restrict dest, const void *restrict src, size_t n);
void *memset(void *dest, int c, size_t n);
int memcmp(const void *lhs, const void *rhs, size_t n);
size_t strlen(const char *str);
char *strchr(const char *str, int ch);

#endif
