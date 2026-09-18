// Read-only GET/DNS checks. Never submits a form, sends a message, or changes hosting.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),dns=require('node:dns/promises');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const {inventory,controls}=require('./public-assets.cjs');
const target=new URL(process.argv[2]||'https://rightawaylending.com/');
const local=['127.0.0.1','localhost','[::1]'].includes(target.hostname);
if(!local&&target.protocol!=='https:')throw Error('A remote hosting check must start with HTTPS.');
if(target.username||target.password||target.search||target.hash||target.pathname!=='/')throw Error('Pass a root origin without credentials, query, or fragment.');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const report={checkedAt:new Date().toISOString(),origin:target.origin,scope:local?'local-preview':'public-host',checks:[],dns:{},limits:['Read-only; phone/email delivery, customer handling, account settings, and browser service-worker installation are not verified by this script.']};
const check=(name,pass,detail)=>report.checks.push({name,pass,detail});
async function get(url,redirect='follow'){
 const r=await fetch(url,{redirect,signal:AbortSignal.timeout(15000),headers:{'User-Agent':'RightAwayLending-ReleaseCheck/1.0','Cache-Control':'no-cache'}});
 return {r,bytes:Buffer.from(await r.arrayBuffer())};
}
async function run(){
 if(!fs.existsSync(path.join(dist,'index.html')))throw Error('Run npm run build first.');
 if(!local){
  for(const [name,type] of [['nameservers','NS'],['addresses','A'],['mail','MX']])try{report.dns[name]=await dns.resolve(target.hostname,type);}catch(e){report.dns[name]={error:e.code};}
  const redirectOrigins=['http://'+target.host+'/'];
  if(target.hostname==='rightawaylending.com')redirectOrigins.push('https://www.rightawaylending.com/');
  for(const u of redirectOrigins){
   try{const {r}=await get(u,'manual');const dest=r.headers.get('location');check('canonical redirect '+u,[301,302,307,308].includes(r.status)&&dest&&new URL(dest,u).href===target.href,{status:r.status,location:dest});}catch(e){check('canonical redirect '+u,false,{error:e.message});}
  }
 }
 const queue=inventory.filter(file=>!controls.has(file)).map(file=>[file,file==='index.html'?'':file]);
 async function next(){
  while(queue.length){const [file,route]=queue.shift();try{
   const {r,bytes}=await get(new URL(route,target));
   check('release file '+file,r.ok&&sha(bytes)===sha(fs.readFileSync(path.join(dist,file))),{status:r.status,finalURL:r.url,matchesBuild:sha(bytes)===sha(fs.readFileSync(path.join(dist,file))),contentType:r.headers.get('content-type')});
   if(file==='index.html'){
    const csp=r.headers.get('content-security-policy')||'';
    const requirements={'x-content-type-options':v=>v==='nosniff','referrer-policy':v=>v==='strict-origin-when-cross-origin','permissions-policy':v=>!!v&&v.includes('camera=()')&&v.includes('microphone=()')};
    for(const [h,predicate]of Object.entries(requirements))check('header '+h,predicate(r.headers.get(h)),r.headers.get(h));
    for(const rule of ["default-src 'self'","script-src 'self'","form-action 'none'","frame-ancestors 'self'","object-src 'none'"])check('CSP '+rule,csp.includes(rule),csp);
    if(!local)check('HSTS',/max-age=[1-9]\d{6,}/.test(r.headers.get('strict-transport-security')||''),r.headers.get('strict-transport-security'));
   }
   if(file==='assets/texas-consumer-complaint-notice.pdf')check('PDF content type',r.headers.get('content-type')?.includes('application/pdf'),r.headers.get('content-type'));
   if(file==='service-worker.js')check('worker is revalidated',/no-cache|no-store|max-age=0/.test(r.headers.get('cache-control')||''),r.headers.get('cache-control'));
  }catch(e){check('release file '+file,false,{error:e.message});}}
 }
 await Promise.all([next(),next(),next()]);
 for(const route of ['missing-release-check/page','js/missing-release-check.js','.git/HEAD','.git/config','.git/index','.git/FETCH_HEAD','.git/logs/HEAD','.wrangler/tmp/no-op-worker.js.map','.github/workflows/static.yml','.assetsignore','.env','.dev.vars','_headers','_redirects','wrangler.jsonc','README.md','documents/RELEASE-VERIFICATION.md','documents/COMPLIANCE-SOURCES.md','assets/site-config.json','assets/new-unreviewed.json','package.json','package-lock.json','scripts/build.cjs','scripts/public-assets.json','tests/asset-publication.test.mjs','node_modules/jsdom/package.json','artifacts/public-files.sha256']){
  try{const {r}=await get(new URL(route,target));check('missing/private path '+route,[403,404].includes(r.status),{status:r.status});}catch(e){check('missing/private path '+route,false,{error:e.message});}
 }
 report.summary={passed:report.checks.filter(c=>c.pass).length,failed:report.checks.filter(c=>!c.pass).length,total:report.checks.length};
 fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
 const file=path.join(root,'artifacts',local?'hosting-local.json':'hosting-public.json');fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({scope:report.scope,origin:report.origin,...report.summary,report:file}));
 for(const failure of report.checks.filter(c=>!c.pass))console.log('FAIL '+failure.name+' '+JSON.stringify(failure.detail));
 if(report.summary.failed)process.exitCode=1;
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
