/**
 * 合集规范校验器 / Collection manifest checker.
 *
 * 一个插件要被收录进 Super Engineer，先要过这一关。它检查的是"装得上、跑得起来"
 * 的最小条件，以及几个最容易在打包后才发现的坑——尤其是**相对路径之外的任何绝对路径**：
 * 插件是被 DSH 从 profile 链接加载的，写死在作者机器上的绝对路径在别人的机器上必然失效。
 *
 * A plugin must pass this before it is accepted into the collection. It checks the
 * minimum for "installs and runs", plus the failures that only show up after
 * packing -- above all any absolute path, which cannot work on someone else's
 * machine.
 *
 * 用法 / Usage:
 *   node tools/verify.mjs                 # 校验 plugins/ 下的每个目录
 *   node tools/verify.mjs /path/to/plugin # 校验任意插件目录（不复制）
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const problems = [];
const notes = [];

/** 记录一个问题。Record one problem. */
function fail(plugin, message) {
	problems.push(`${plugin}: ${message}`);
}

/** 校验一个插件目录。Check one plugin directory. */
function checkPlugin(directory) {
	const name = basename(directory);
	const manifestPath = join(directory, 'package.json');
	if (!existsSync(manifestPath)) {
		fail(name, '缺少 package.json / missing package.json');
		return undefined;
	}
	let manifest;
	try {
		manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
	} catch (error) {
		fail(name, `package.json 不是合法 JSON / invalid JSON: ${error.message}`);
		return undefined;
	}

	// 必需字段 / required fields
	for (const field of ['name', 'version', 'description']) {
		if (typeof manifest[field] !== 'string' || manifest[field].trim() === '') fail(name, `package.json 缺少 ${field}`);
	}
	if (manifest.private !== true) notes.push(`${name}: 建议 private: true（合集内的插件不单独发 npm / not meant to be published to npm alone）`);

	// 入口 / entry
	const entry = manifest.exports?.['.'] ?? manifest.main;
	if (typeof entry !== 'string') fail(name, 'package.json 未声明宿主入口（exports["."]）');
	else if (!existsSync(join(directory, entry))) fail(name, `宿主入口不存在 / host entry missing: ${entry}`);

	// 浏览器半 / browser half
	const client = manifest.exports?.['./client'];
	if (typeof client === 'string' && !existsSync(join(directory, client))) fail(name, `浏览器入口不存在 / client entry missing: ${client}`);
	const dshClient = manifest.dsh?.client;
	if (dshClient !== undefined) {
		if (dshClient.platform !== 'web') fail(name, `dsh.client.platform 应为 "web"，实际 ${JSON.stringify(dshClient.platform)}`);
		if (!Array.isArray(dshClient.inject)) fail(name, 'dsh.client.inject 必须是数组');
	}

	// profile 层 / profile patch
	const patch = manifest.dsh?.bundle?.patch;
	if (typeof patch === 'string') {
		if (!existsSync(join(directory, patch))) fail(name, `dsh.bundle.patch 指向的文件不存在: ${patch}`);
		else {
			const text = readFileSync(join(directory, patch), 'utf8');
			if (!text.includes('insert:')) fail(name, `${patch} 里没有 insert: 行（profile 层不会插入任何东西）`);
			if (!/name:\s*['"]?@?[\w./-]+['"]?/.test(text)) fail(name, `${patch} 里没有 name: 字段`);
		}
	} else {
		fail(name, 'dsh.bundle.patch 未声明（DSH 无法把它挂进 profile）');
	}

	// 图标 / icon
	const icon = manifest.icon;
	if (icon !== undefined && !existsSync(join(directory, icon))) fail(name, `icon 指向的文件不存在: ${icon}`);
	else if (icon !== undefined && statSync(join(directory, icon)).size > 256 * 1024) fail(name, `icon 超过 256 KiB（DSH 的清单上限）`);

	// files 白名单必须覆盖真正要装的东西 / the files list must ship what is loaded
	// 两侧都要去掉 "./" 前缀：exports 习惯写 "./index.js"，files 习惯写 "index.js"。
	const trim = (value) => String(value).replace(/^\.\//, '');
	if (Array.isArray(manifest.files)) {
		for (const file of [entry, client, patch, icon].filter((value) => typeof value === 'string')) {
			const wanted = trim(file);
			const shipped = manifest.files.some((pattern) => {
				const candidate = trim(pattern);
				if (candidate === wanted) return true;
				return candidate.endsWith('/*') && wanted.startsWith(candidate.slice(0, -1));
			});
			if (!shipped) fail(name, `files 白名单未包含 ${wanted}（打包后会缺文件）`);
		}
	}

	// 绝对路径：打包后必然失效 / absolute paths cannot survive packing
	for (const file of [entry, client].filter((value) => typeof value === 'string')) {
		const target = join(directory, file);
		if (!existsSync(target)) continue;
		const text = readFileSync(target, 'utf8');
		const hits = text.match(/(?:from|require\(|import\()\s*['"](\/[^'"]+)['"]/g);
		if (hits !== null) fail(name, `${file} 里出现绝对路径导入，换台机器就找不到: ${hits.slice(0, 2).join(', ')}`);
		const localHits = text.match(/\/Users\/[A-Za-z0-9_.-]+/g);
		if (localHits !== null) notes.push(`${name}: ${file} 提及本机路径 ${localHits[0]}…（若只是注释可忽略 / ignore if it is only a comment）`);
	}
	return manifest;
}

const targets = process.argv.slice(2);
const directories =
	targets.length > 0
		? targets.map((target) => resolve(target))
		: existsSync(join(ROOT, 'plugins'))
			? readdirSync(join(ROOT, 'plugins'), { withFileTypes: true })
					.filter((entry) => entry.isDirectory())
					.map((entry) => join(ROOT, 'plugins', entry.name))
			: [];

if (directories.length === 0) {
	console.log('plugins/ 下还没有插件。/ No plugins in plugins/ yet.');
	console.log('把一个插件目录放进来，或直接校验任意目录：node tools/verify.mjs /path/to/plugin');
	process.exit(0);
}

const seen = new Map();
for (const directory of directories) {
	const manifest = checkPlugin(directory);
	if (manifest?.name !== undefined) {
		if (seen.has(manifest.name)) fail(basename(directory), `包名与 ${seen.get(manifest.name)} 重复: ${manifest.name}`);
		else seen.set(manifest.name, basename(directory));
	}
}

for (const note of notes) console.log(`  ·  ${note}`);
console.log('');
if (problems.length > 0) {
	console.log(`${problems.length} 个问题 / problem(s):`);
	for (const problem of problems) console.log(`  ✗  ${problem}`);
	process.exit(1);
}
console.log(`✓ ${directories.length} 个插件通过校验 / plugin(s) passed`);
