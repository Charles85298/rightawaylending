const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const documents = new Map(pages.map(file => [file, new JSDOM(fs.readFileSync(path.join(root,file),'utf8')).window.document]));
const issues = [];
for (const [file, doc] of documents) {
  const complain = message => issues.push(`${file}: ${message}`);
  for (const selector of ['main#main-content','.header','#menu','#mobilemenu','body > footer','link[href*="css/site.css"]']) if (!doc.querySelector(selector)) complain('Missing '+selector);
  if (doc.querySelectorAll('h1').length !== 1) complain('Expected exactly one h1');
  const ids = [...doc.querySelectorAll('[id]')].map(el=>el.id);
  if (new Set(ids).size !== ids.length) complain('Duplicate IDs');
  if (doc.querySelector('base')) complain('Base URL leaks local navigation');
  for (const element of doc.querySelectorAll('[src],link[href],a[href]')) {
    const value = element.getAttribute(element.hasAttribute('src')?'src':'href');
    if (!value || /^(?:https?:|data:|tel:|mailto:|sms:)/i.test(value)) continue;
    const url = new URL(value,'https://local.invalid/'+file);
    const target = decodeURIComponent(url.pathname).replace(/^\//,'') || 'index.html';
    if (!fs.existsSync(path.join(root,target))) complain('Broken local resource '+value);
    if (url.hash && documents.has(target) && !documents.get(target).getElementById(decodeURIComponent(url.hash.slice(1)))) complain('Broken fragment '+value);
  }
  for (const input of doc.querySelectorAll('input,select,textarea')) {
    if (input.type==='hidden') continue;
    if (!(input.getAttribute('aria-label') || input.getAttribute('aria-labelledby') || input.closest('label') || (input.id && doc.querySelector(`label[for="${input.id}"]`)))) complain('Unlabelled field '+input.id);
  }
  for (const element of doc.querySelectorAll('[aria-controls],[aria-labelledby],[aria-describedby]')) {
    for (const attr of ['aria-controls','aria-labelledby','aria-describedby']) for (const id of (element.getAttribute(attr)||'').split(/\s+/).filter(Boolean)) if (!doc.getElementById(id)) complain('Missing ARIA target '+id);
  }
  if ([...doc.scripts].some(script=>!script.src && !script.type)) complain('Inline executable script violates hosting policy');
  if (/127\.0\.0\.1|localhost|Sequence complete|intelligence layer|#69be28/i.test(doc.documentElement.outerHTML)) complain('Stale preview/private teaser/green brand reference');
}
for (const file of ['css/styles.css','css/site.css']) {
  const css=fs.readFileSync(path.join(root,file),'utf8');
  for(const [,raw] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (/^(?:#|data:|https?:)/.test(raw)) continue;
    if (!fs.existsSync(path.resolve(root,path.dirname(file),raw.split('?')[0]))) issues.push(`${file}: missing CSS asset ${raw}`);
  }
}
if (issues.length) { console.error(issues.join('\n')); process.exitCode=1; }
else console.log(`PASS: ${pages.length} pages; local links, assets, fragments, shared shell, field labels, ARIA targets, and script policy.`);
