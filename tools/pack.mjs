/**
 * 打成可安装的 tarball / Pack each plugin into an installable tarball.
 *
 * DSH 的插件安装通道（`pluginManager.installBundle`）接受四类规格：本地绝对路径、
 * git 仓库、**tarball 直链**、npm 包名。tarball 是这里最有用的一个——它可以让别人
 * 不必克隆整个仓库，也能让作者在"谁拿到包"这件事上有控制权。
 *
 * The installer accepts an absolute path, a git repository, a **tarball URL**, or an
 * npm name. The tarball is the useful one here: it lets someone install a single
 * plugin without cloning the collection, and it keeps the author in control of who
 * receives the package.
 *
 * 用法 / Usage:
 *   node tools/pack.mjs              # 打包 plugins/ 下全部插件到 dist/
 *   node tools/pack.mjs /path/to/plugin
 */
import { readFileSync, existsSync, mkdirSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

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
	console.log('没有可打包的插件。/ Nothing to pack.');
	process.exit(0);
}

mkdirSync(DIST, { recursive: true });

/**
 * 展开一个 `files` 模式。`execFileSync` 不经过 shell，所以 `locale/*.json`
 * 不会被展开——必须自己列目录，否则 tar 会把它当字面文件名并报错。
 *
 * Expand one `files` pattern. `execFileSync` does not go through a shell, so
 * `locale/*.json` is never globbed; doing it here is what keeps tar from
 * treating the pattern as a literal file name.
 */
function expand(directory, pattern) {
	const clean = String(pattern).replace(/^\.\//, '');
	const star = clean.indexOf('*');
	if (star < 0) return existsSync(join(directory, clean)) ? [clean] : [];
	const slash = clean.lastIndexOf('/', star);
	const prefix = slash < 0 ? '' : clean.slice(0, slash + 1);
	const suffix = clean.slice(star + 1);
	const base = join(directory, prefix === '' ? '.' : prefix);
	if (!existsSync(base)) return [];
	return readdirSync(base)
		.filter((name) => name.endsWith(suffix))
		.map((name) => `${prefix}${name}`);
}

const packed = [];
for (const directory of directories) {
	const manifestPath = join(directory, 'package.json');
	if (!existsSync(manifestPath)) {
		console.error(`跳过 ${basename(directory)}：没有 package.json`);
		continue;
	}
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
	const fileName = `${String(manifest.name).replace(/^@/, '').replace(/[/]/g, '-')}-${manifest.version}.tgz`;
	const target = join(DIST, fileName);
	/* 只带清单里声明的内容：npm 的打包规则在这里不适用（我们不打 npm 包），
	   而开发文件（测试、论文、截图）不该进交付包。 */
	const patterns = Array.isArray(manifest.files) && manifest.files.length > 0 ? manifest.files : ['*'];
	const wanted = new Set(['package.json']);
	for (const pattern of patterns) {
		const matched = expand(directory, pattern);
		if (matched.length === 0) console.warn(`  ·  ${basename(directory)}: files 里的 ${pattern} 没有匹配到文件（已跳过）`);
		for (const file of matched) wanted.add(file);
	}
	execFileSync('tar', ['-czf', target, '-C', directory, ...[...wanted]], { stdio: 'pipe' });
	const bytes = readFileSync(target);
	packed.push({
		name: manifest.name,
		version: manifest.version,
		file: `dist/${fileName}`,
		bytes: bytes.length,
		sha256: createHash('sha256').update(bytes).digest('hex'),
	});
	console.log(`✓ ${fileName}  ${(bytes.length / 1024).toFixed(1)} KiB`);
}

writeFileSync(join(DIST, 'SHA256SUMS.txt'), packed.map((entry) => `${entry.sha256}  ${entry.file}`).join('\n') + '\n');
writeFileSync(join(DIST, 'packed.json'), `${JSON.stringify({ packedAt: new Date().toISOString(), packages: packed }, null, 2)}\n`);
console.log('');
console.log(`${packed.length} 个包已生成到 dist/，校验和见 dist/SHA256SUMS.txt`);
console.log('安装方式：把某个包的**直链**（GitHub Release 附件地址）粘到 DSH 的「插件 → 添加插件」即可。');
