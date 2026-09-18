const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const inventory = require('./public-assets.json');
const controls = new Set(['_headers', '_redirects']);
const sha = data => crypto.createHash('sha256').update(data).digest('hex');

function validateInventory(root, files) {
  if (!Array.isArray(files) || files.length === 0 || files.length > 100 || new Set(files).size !== files.length) {
    throw new Error('Invalid or duplicated public inventory');
  }
  const canonicalRoot = fs.realpathSync(root);
  for (const file of files) {
    if (typeof file !== 'string' || (!controls.has(file) && !/^(?:(?:assets|css|images|js)\/)?[a-z0-9-]+\.(?:html|css|js|json|png|jpg|pdf|xml|txt)$/.test(file))) {
      throw new Error('Unsafe public inventory path');
    }
    let current = canonicalRoot;
    for (const part of file.split('/')) {
      current = path.join(current, part);
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Public sources must not be symbolic links');
    }
    if (!fs.statSync(current).isFile() || !fs.realpathSync(current).startsWith(canonicalRoot + path.sep)) {
      throw new Error('Public source escaped the source directory');
    }
  }
  return canonicalRoot;
}

function assetRules(files) {
  const publicFiles = files.filter(file => !controls.has(file));
  const parents = [...new Set(publicFiles.filter(file => file.includes('/')).map(file => file.split('/')[0]))].sort();
  return ['# Generated exact public allowlist. Parsed controls are never downloadable.', '*',
    ...parents.map(dir => `!/${dir}/`), ...publicFiles.map(file => `!/${file}`), ''].join('\n');
}

function buildPublic(sourceRoot, files = inventory) {
  const root = validateInventory(sourceRoot, files);
  // Snapshot admitted bytes before touching generated output. Source files are not rewritten.
  const snapshot = files.map(file => ({ file, data: fs.readFileSync(path.join(root, file)) }));
  const dist = path.join(root, 'dist');
  if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') throw new Error('Unsafe build destination');
  if (fs.existsSync(dist) && (fs.lstatSync(dist).isSymbolicLink() || fs.realpathSync(dist) !== dist)) {
    throw new Error('Build destination must be the local generated dist directory');
  }
  const artifacts = path.join(root, 'artifacts');
  if (fs.existsSync(artifacts) && (fs.lstatSync(artifacts).isSymbolicLink() || fs.realpathSync(artifacts) !== artifacts)) {
    throw new Error('Artifact destination must stay local');
  }
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  const manifest = [];
  for (const { file, data } of snapshot) {
    const target = path.join(dist, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
    manifest.push(`${sha(data)}  ${file}`);
  }
  const rules = assetRules(files);
  fs.writeFileSync(path.join(dist, '.assetsignore'), rules);
  manifest.push(`${sha(rules)}  .assetsignore`);
  fs.mkdirSync(artifacts, { recursive: true });
  fs.writeFileSync(path.join(artifacts, 'public-files.sha256'), manifest.join('\n') + '\n');
  return { dist, publicFiles: files.filter(file => !controls.has(file)).length, controls: files.filter(file => controls.has(file)).length };
}

module.exports = { inventory, controls, validateInventory, assetRules, buildPublic };
