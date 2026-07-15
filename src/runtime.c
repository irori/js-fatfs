#include <stddef.h>
#include <stdint.h>
#include <string.h>

void *memcpy(void *restrict dest, const void *restrict src, size_t n)
{
	unsigned char *d = dest;
	const unsigned char *s = src;
	while (n--) *d++ = *s++;
	return dest;
}

void *memset(void *dest, int c, size_t n)
{
	unsigned char *d = dest;
	while (n--) *d++ = (unsigned char)c;
	return dest;
}

int memcmp(const void *lhs, const void *rhs, size_t n)
{
	const unsigned char *l = lhs;
	const unsigned char *r = rhs;
	while (n--) {
		if (*l != *r) return *l - *r;
		l++;
		r++;
	}
	return 0;
}

size_t strlen(const char *str)
{
	const char *end = str;
	while (*end) end++;
	return (size_t)(end - str);
}

char *strchr(const char *str, int ch)
{
	do {
		if (*str == (char)ch) return (char *)str;
	} while (*str++);
	return NULL;
}

typedef struct Block {
	size_t size;
	struct Block *next;
} Block;

extern unsigned char __heap_base;
static uintptr_t heap_end;
static Block *free_list;

static size_t align8(size_t value)
{
	return (value + 7) & ~(size_t)7;
}

static int grow_to(uintptr_t end)
{
	const size_t page_size = 65536;
	size_t current = __builtin_wasm_memory_size(0) * page_size;
	if (end <= current) return 1;
	size_t pages = (end - current + page_size - 1) / page_size;
	return __builtin_wasm_memory_grow(0, pages) != (size_t)-1;
}

void *malloc(size_t size)
{
	if (!size) size = 1;
	size = align8(size);
	Block **link = &free_list;
	for (Block *block = free_list; block; block = block->next) {
		if (block->size >= size) {
			*link = block->next;
			return block + 1;
		}
		link = &block->next;
	}

	if (!heap_end) heap_end = align8((uintptr_t)&__heap_base);
	uintptr_t next = heap_end + sizeof(Block) + size;
	if (next < heap_end || !grow_to(next)) return NULL;
	Block *block = (Block *)heap_end;
	block->size = size;
	heap_end = next;
	return block + 1;
}

void free(void *ptr)
{
	if (!ptr) return;
	Block *block = (Block *)ptr - 1;
	Block **link = &free_list;
	while (*link && *link < block) link = &(*link)->next;
	block->next = *link;
	*link = block;

	if (block->next && (unsigned char *)(block + 1) + block->size == (unsigned char *)block->next) {
		block->size += sizeof(Block) + block->next->size;
		block->next = block->next->next;
	}
	if (link != &free_list) {
		Block *previous = free_list;
		while (previous->next != block) previous = previous->next;
		if ((unsigned char *)(previous + 1) + previous->size == (unsigned char *)block) {
			previous->size += sizeof(Block) + block->size;
			previous->next = block->next;
		}
	}
}
