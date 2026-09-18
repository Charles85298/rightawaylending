import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = 'dd65de03fb5164d53989a100393219d4420f93a7';
const rules = readFileSync(resolve(root, '.assetsignore'), 'utf8')
  .split(/\r?\n/).filter(line => line && !line.startsWith('#'));
const admitted = rules.slice(1).filter(line => !line.endsWith('/')).map(line => line.slice(2));
const controls = new Set(['_headers', '_redirects']);
const publicFiles = admitted.filter(file => !controls.has(file));
const excluded = [
  '.git/HEAD', '.git/config', '.git/index', '.git/FETCH_HEAD', '.git/logs/HEAD',
  '.git/objects/dd/65de03fb5164d53989a100393219d4420f93a7',
  '.wrangler/tmp/deploy/no-op-worker.js.map', '.github/workflows/static.yml',
  '.assetsignore', '.gitignore', 'wrangler.jsonc', 'README.md',
  'documents/Integration-Guide-v20.md', 'documents/company details.txt',
  'assets/site-config.json', '.env', '.env.production', '.dev.vars',
  'assets/.env', 'assets/new-unreviewed.json', 'css/new-unreviewed.css',
  'js/new-unreviewed.js', 'images/new-unreviewed.png', 'new-unreviewed.html',
  'tests/asset-publication.test.mjs', 'node_modules/example/index.js',
  'homepage-mockup.png', 'artifacts/private-receipt.json',
];
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 10 * 1024 * 1024 });
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceBytes = file => git(['show', `${baseline}:${file}`]);

test('allowlist is deny-by-default with only exact, safe file exceptions', () => {
  assert.equal(rules[0], '*');
  assert.equal(new Set(rules).size, rules.length);
  for (const rule of rules.slice(1)) {
    assert.match(rule, /^!\/[A-Za-z0-9_/-]+(?:\.[A-Za-z0-9]+)?\/?$/);
    assert.ok(!rule.includes('..'));
  }
  assert.equal(admitted.length, 48);
  for (const file of admitted) assert.ok(statSync(resolve(root, file)).isFile(), file);
});

test('Git ignore semantics admit only the public inventory and refuse internal/future files', () => {
  const paths = [...admitted, ...excluded];
  // No rules are installed in Git config; the override exists for this command only.
  const result = execFileSync('git', [
    '-c', 'core.excludesFile=.assetsignore', 'check-ignore', '--no-index',
    '--non-matching', '--verbose', '-z', '--stdin',
  ], { cwd: root, input: paths.join('\0') + '\0', encoding: 'utf8' });
  const fields = result.split('\0');
  for (let i = 0; i < paths.length; i += 1) {
    const pattern = fields[i * 4 + 2];
    assert.equal(fields[i * 4 + 3], paths[i]);
    assert.equal(pattern.startsWith('!'), admitted.includes(paths[i]), paths[i]);
  }
});

test('all previously tracked HTML pages and every admitted file remain byte-identical', () => {
  const html = git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n')
    .filter(file => file.endsWith('.html'));
  assert.equal(html.length, 32);
  for (const file of html) assert.ok(admitted.includes(file), file);
  for (const file of admitted) {
    assert.equal(digest(readFileSync(resolve(root, file))), digest(sourceBytes(file)), file);
  }
});

test('existing local page, CSS, JS and manifest dependencies are admitted', () => {
  const references = [];
  for (const file of publicFiles.filter(value => /\.(html|css)$/.test(value))) {
    const text = readFileSync(resolve(root, file), 'utf8');
    const re = file.endsWith('.html') ? /(?:src|href)\s*=\s*["']([^"']+)["']/g : /url\(\s*["']?([^"')]+)["']?\s*\)/g;
    for (const match of text.matchAll(re)) {
      const href = match[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) continue;
      const path = decodeURIComponent(new URL(href, `https://site.invalid/${file}`).pathname).slice(1);
      if (path) references.push({ file, path });
    }
  }
  for (const reference of references) {
    assert.ok(admitted.includes(reference.path), `${reference.file} -> ${reference.path}`);
  }
  const manifest = JSON.parse(readFileSync(resolve(root, 'assets/manifest.json'), 'utf8'));
  for (const icon of manifest.icons) assert.ok(admitted.includes(`assets/${icon.src}`));
});

test('explicit Wrangler configuration preserves existing mode without routes or bindings', () => {
  const config = JSON.parse(readFileSync(resolve(root, 'wrangler.jsonc'), 'utf8'));
  assert.equal(config.name, 'rightawaylending');
  assert.equal(config.compatibility_date, '2026-09-17');
  assert.deepEqual(config.assets, { directory: '.' });
  assert.deepEqual(Object.keys(config).sort(), ['$schema', 'assets', 'compatibility_date', 'name', 'observability']);
});

const origin = process.env.PUBLIC_ASSET_TEST_ORIGIN;
if (origin) {
  const allowedOrigins = new Set([
    'http://127.0.0.1:8791', 'https://rightawaylending.com',
    'https://www.rightawaylending.com', 'https://rightawaylending.charles-g-fleming.workers.dev',
  ]);
  assert.ok(allowedOrigins.has(origin), 'Test origin must be explicitly in scope.');
  test('served public files match original source bytes and internal files return 404', { timeout: 120000 }, async () => {
    for (const file of publicFiles) {
      const response = await fetch(`${origin}/${file}`, { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, file);
      assert.equal(digest(Buffer.from(await response.arrayBuffer())), digest(sourceBytes(file)), file);
    }
    for (const file of excluded) {
      const response = await fetch(`${origin}/${file}`, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 404, file);
    }
    console.log(`Verified ${publicFiles.length} byte-identical public files and ${excluded.length} refused internal paths at ${origin}`);
  });
}
