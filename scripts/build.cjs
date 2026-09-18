const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildPublic } = require('./public-assets.cjs');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname, 'check-site.cjs')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(__dirname, 'check-disclosures.cjs')], { stdio: 'inherit' });
const result = buildPublic(root);
console.log(`Built ${result.publicFiles} public files, ${result.controls} parsed controls and one deny-by-default asset list in ${result.dist}`);
