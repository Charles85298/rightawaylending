const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function worker({offline=false}={}) {
  const handlers={},deleted=[],stored=[];
  const cache={addAll:async assets=>{stored.push(...assets);},put:async request=>stored.push(request.url),match:async key=>key==='./offline.html'?{offline:true}:undefined};
  const context={URL,Set,Promise,caches:{keys:async()=>['other-app-cache','right-away-lending-v20','right-away-lending-brand-20260918'],delete:async name=>deleted.push(name),open:async()=>cache},self:{location:{origin:'https://rightawaylending.com',href:'https://rightawaylending.com/service-worker.js'},addEventListener:(name,fn)=>{handlers[name]=fn;}},fetch:async()=>{if(offline)throw Error('offline');return {ok:true,clone(){return this;}};}};
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../service-worker.js'),'utf8'),context);
  return {handlers,deleted,stored};
}
test('offline upgrade removes only this website’s outdated caches',async()=>{
  const w=worker();let done;w.handlers.activate({waitUntil:p=>done=p});await done;assert.deepEqual(w.deleted,['right-away-lending-v20','right-away-lending-brand-20260918']);
});
test('offline installation includes only real public assets',async()=>{
  const w=worker();let done;w.handlers.install({waitUntil:p=>done=p});await done;
  for(const name of w.stored) assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',name.split('?')[0])),name);
  assert.ok(!w.stored.some(name=>/prequalify|documents\//.test(name)));
});
test('worker bypasses POST, third-party requests, and uncached assets',()=>{
  const w=worker();let intercepted=0;
  for(const request of [{method:'POST',url:'https://rightawaylending.com/prequalify.html'},{method:'GET',url:'https://other.invalid/private'},{method:'GET',url:'https://rightawaylending.com/private.json'}])w.handlers.fetch({request,respondWith(){intercepted++;}});
  assert.equal(intercepted,0);
});
test('worker never stores inquiry pages or a URL with query data',async()=>{
  const w=worker();
  for(const url of ['https://rightawaylending.com/prequalify.html','https://rightawaylending.com/index.html?name=fictional']){let response;w.handlers.fetch({request:{method:'GET',mode:'navigate',url},respondWith:p=>response=p});await response;}
  assert.deepEqual(w.stored,[]);
});
test('offline navigation has an HTML fallback without substituting HTML for scripts',async()=>{
  const w=worker({offline:true});let response;w.handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://rightawaylending.com/prequalify.html'},respondWith:p=>response=p});assert.deepEqual(await response,{offline:true});
});
