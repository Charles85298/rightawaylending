import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const require = createRequire(import.meta.url);
const { inventory, controls, validateInventory, assetRules, buildPublic } = require('../scripts/public-assets.cjs');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('exact inventory admits 34 HTML pages and only 55 public files plus two parsed controls', () => {
  validateInventory(root, inventory);
  assert.equal(inventory.length, 57);
  assert.equal(inventory.filter(file => file.endsWith('.html')).length, 34);
  assert.deepEqual(inventory.filter(file => file.endsWith('.html')).sort(), readdirSync(root).filter(file => file.endsWith('.html')).sort());
  for (const file of ['.git/HEAD', '.env', 'assets/site-config.json', 'package.json', 'wrangler.jsonc', 'documents/COMPLIANCE-SOURCES.md']) assert.ok(!inventory.includes(file));
});

test('both source and output publishing boundaries deny all future unreviewed files', () => {
  const sourceRules = readFileSync(join(root, '.assetsignore'), 'utf8').split('\n').filter(line => line && !line.startsWith('#'));
  assert.deepEqual(sourceRules, ['*']);
  const rules = assetRules(inventory).split('\n').filter(line => line && !line.startsWith('#'));
  assert.equal(rules[0], '*');
  for (const rule of rules.slice(1)) assert.match(rule, /^!\/[A-Za-z0-9_/-]+(?:\.[A-Za-z0-9]+)?\/?$/);
  assert.equal(rules.filter(rule => !rule.endsWith('/')).length - 1, 55);
  assert.ok(!rules.includes('!/_headers'));
  assert.ok(!rules.includes('!/_redirects'));
});

test('unsafe and duplicated inventory paths refuse before publication', () => {
  for (const files of [[], ['index.html', 'index.html'], ['../index.html'], ['.env'], ['/index.html'], ['js\\app.js'], ['documents/COMPLIANCE-SOURCES.md']]) assert.throws(() => validateInventory(root, files));
});

test('build copies only named files, preserves their bytes, and removes stale generated output', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'rightaway-publication-'));
  try {
    writeFileSync(join(fixture, 'index.html'), '<h1>Synthetic publication test</h1>');
    writeFileSync(join(fixture, 'private.txt'), 'synthetic-not-public');
    mkdirSync(join(fixture, 'dist'));
    writeFileSync(join(fixture, 'dist', 'stale.txt'), 'synthetic-stale-output');
    buildPublic(fixture, ['index.html']);
    assert.deepEqual(readdirSync(join(fixture, 'dist')).sort(), ['.assetsignore', 'index.html']);
    assert.equal(readFileSync(join(fixture, 'dist', 'index.html'), 'utf8'), readFileSync(join(fixture, 'index.html'), 'utf8'));
    assert.ok(readFileSync(join(fixture, 'artifacts', 'public-files.sha256'), 'utf8').includes('index.html'));
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});

test('junction destination and junction source refuse rather than read/write outside the build root', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'rightaway-publication-links-'));
  const outside = mkdtempSync(join(tmpdir(), 'rightaway-publication-outside-'));
  try {
    writeFileSync(join(fixture, 'index.html'), '<h1>Synthetic</h1>');
    writeFileSync(join(outside, 'keep.txt'), 'synthetic-preserve');
    writeFileSync(join(outside, 'app.js'), '// synthetic outside source');
    symlinkSync(outside, join(fixture, 'dist'), 'junction');
    assert.throws(() => buildPublic(fixture, ['index.html']), /Build destination/);
    assert.equal(readFileSync(join(outside, 'keep.txt'), 'utf8'), 'synthetic-preserve');
    symlinkSync(outside, join(fixture, 'js'), 'junction');
    assert.throws(() => validateInventory(fixture, ['js/app.js']), /symbolic links/);
  } finally {
    rmSync(join(fixture, 'dist'), { recursive: true, force: true });
    rmSync(join(fixture, 'js'), { recursive: true, force: true });
    rmSync(fixture, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test('Workers configuration selects dist and compatible relative redirects without changing domains', () => {
  const config = JSON.parse(readFileSync(join(root, 'wrangler.jsonc'), 'utf8'));
  assert.equal(config.name, 'rightawaylending');
  assert.equal(config.compatibility_date, '2026-09-17');
  assert.deepEqual(config.assets, { directory: './dist', not_found_handling: '404-page' });
  assert.deepEqual(Object.keys(config).sort(), ['$schema', 'assets', 'compatibility_date', 'name', 'observability']);
  const redirects = readFileSync(join(root, '_redirects'), 'utf8').split('\n').filter(line => line && !line.startsWith('#'));
  assert.equal(redirects.length, 29);
  for (const line of redirects) assert.match(line, /^\/[a-z-]+\.html \/(?:[a-z-]+)? 301$/);
  assert.equal(controls.size, 2);
  assert.equal(readFileSync(join(root, '.node-version'), 'utf8').trim(), '24.19.0');
  for (const workflow of ['verify.yml', 'static.yml']) {
    assert.match(readFileSync(join(root, '.github', 'workflows', workflow), 'utf8'), /node-version-file: '\.node-version'/);
  }
});
