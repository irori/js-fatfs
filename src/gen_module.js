import { readFile, writeFile } from 'node:fs/promises';

const [wasmPath, runtimePath, outputPath] = process.argv.slice(2);
const bytes = await readFile(wasmPath);
const module = await WebAssembly.compile(bytes);
const env = {};
for (const entry of WebAssembly.Module.imports(module)) env[entry.name] = () => 0;
const { exports } = await WebAssembly.instantiate(module, { env });
const constants = Object.entries(exports)
	.filter(([name, value]) => name.startsWith('constant_') && typeof value === 'function')
	.map(([name, value]) => [name.slice('constant_'.length), value()])
	.sort(([a], [b]) => a.localeCompare(b));
const declarations = constants.map(([name, value]) => `export const ${name} = ${value};`).join('\n');
const runtime = await readFile(runtimePath, 'utf8');
await writeFile(outputPath, `${declarations}\n\n${runtime}`);
