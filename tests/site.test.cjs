const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const math=require('../js/mortgage-math.js');
const root=path.resolve(__dirname,'..');
async function load(file,blockStorage=false) {
  const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'http://127.0.0.1/'+file,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;
  w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=()=>{};w.scrollTo=()=>{};
  w.print=()=>{w.dispatchEvent(new w.Event('beforeprint'));w.__printed=true;};
  w.fetch=()=>{throw new Error('Unexpected network request');};
  if(blockStorage) Object.defineProperty(w,'localStorage',{get(){throw new Error('Storage disabled');}});
  await new Promise(resolve=>w.addEventListener('DOMContentLoaded',resolve,{once:true}));
  for(const script of w.document.querySelectorAll('script[src]')) w.eval(fs.readFileSync(path.join(root,new URL(script.src).pathname.slice(1)),'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return {dom,w,d:w.document,errors,$:id=>w.document.getElementById(id),close:()=>dom.window.close()};
}
function click(d,selector){const button=d.querySelector(selector);assert.ok(button,selector);button.click();}
function fill(ctx,id,value){ctx.$(id).value=value;ctx.$(id).dispatchEvent(new ctx.w.Event('input',{bubbles:true}));}
test('mortgage math: independent known payment, zero interest, inverse, invalid input',()=>{
  assert.ok(Math.abs(math.monthlyPayment(380000,6.5,30)-2401.858489273268)<.00001);
  assert.equal(math.monthlyPayment(120000,0,10),1000);
  assert.ok(Math.abs(math.supportedPrincipal(2401.858489273268,6.5,30)-380000)<.01);
  assert.equal(math.monthlyPayment(-1,6,30),0);
  assert.equal(math.monthlyPayment(120000,6,0),0);
  assert.equal(math.supportedPrincipal(NaN,6,30),0);
});
test('break-even: normal, free, zero savings, higher payment, invalid input',()=>{
  assert.deepEqual(math.breakEven(6000,2500,2200),{savings:300,months:20});
  assert.deepEqual(math.breakEven(0,2500,2200),{savings:300,months:0});
  assert.equal(math.breakEven(6000,2500,2500),null);
  assert.equal(math.breakEven(6000,2500,2600),null);
  assert.equal(math.breakEven(-1,2500,2200),null);
});
for(const file of fs.readdirSync(root).filter(file=>file.endsWith('.html'))) test(`page ${file}: initializes with functional theme/menu and no script errors`,async()=>{
  const ctx=await load(file);try{
    assert.deepEqual(ctx.errors,[]);
    const before=ctx.d.documentElement.dataset.theme;ctx.$('theme').click();assert.notEqual(ctx.d.documentElement.dataset.theme,before);
    ctx.$('menu').click();assert.equal(ctx.$('menu').getAttribute('aria-expanded'),'true');
    ctx.d.dispatchEvent(new ctx.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(ctx.$('menu').getAttribute('aria-expanded'),'false');
    assert.deepEqual(ctx.errors,[]);
  }finally{ctx.close();}
});
test('site remains interactive when browser storage is disabled',async()=>{
  const c=await load('index.html',true);try{c.$('theme').click();c.$('menu').click();assert.deepEqual(c.errors,[]);assert.equal(c.$('menu').getAttribute('aria-expanded'),'true');}finally{c.close();}
});
test('homepage: finder, back/reset, program handoff, FAQ, journey and calculator link',async()=>{
  const c=await load('index.html');try{
    click(c.d,'.finder-options [data-value="first"]');click(c.d,'.finder-options [data-value="low"]');click(c.d,'.finder-options [data-value="no"]');
    assert.match(c.$('loanFinderTitle').textContent,/FHA/);assert.equal(c.$('loanFinderResult').hidden,false);
    click(c.d,'#finderLightningPrograms button');assert.equal(c.$('lightningTitle').textContent,'FHA');assert.match(c.$('lightningCta').href,/fha-loans.html$/);
    c.$('finderBack').click();assert.equal(c.d.querySelector('.loan-finder-step[data-step="3"]').hidden,false);
    c.$('finderReset').click();assert.equal(c.d.querySelector('.loan-finder-step[data-step="1"]').hidden,false);
    click(c.d,'.faq-item button');assert.equal(c.d.querySelector('.faq-item p').hidden,false);
    click(c.d,'.journey-node:last-child');assert.match(c.$('journeyDetail').textContent,/final terms/);
    assert.match(c.d.querySelector('.mini-calculator a').href,/affordability-calculator.html$/);
    assert.equal(c.d.querySelector('[data-rate]'),null);assert.equal(c.$('snapshotPayment'),null);assert.deepEqual(c.errors,[]);
  }finally{c.close();}
});
test('calculator: affordability expenses, payment chart, clamp, all-zero case, report and keyboard tabs',async()=>{
  const c=await load('affordability-calculator.html');try{
    assert.match(c.$('primaryResult').textContent,/1,589/);
    fill(c,'affordMonthlyHoa','2000');assert.match(c.$('primaryResult').textContent,/\$0/);
    c.$('paymentTab').click();assert.match(c.$('primaryResult').textContent,/2,943/);
    fill(c,'downPayment','400000');fill(c,'homePrice','100000');assert.equal(c.$('downPayment').value,'100000');
    for(const id of ['propertyTaxRate','annualInsurance','monthlyHoa','pmiRate'])fill(c,id,'0');
    assert.match(c.$('primaryResult').textContent,/\$0/);assert.doesNotMatch(c.$('paymentDonut').style.background,/NaN|Infinity/);
    c.$('savePdfButton').click();assert.equal(c.w.__printed,true);assert.ok(c.$('pdfInputs').children.length>=8);
    c.$('paymentTab').dispatchEvent(new c.w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.equal(c.$('affordTab').getAttribute('aria-selected'),'true');assert.deepEqual(c.errors,[]);
  }finally{c.close();}
});
test('wizard: requires each answer, complete result, back from result',async()=>{
  const c=await load('loan-qualification-wizard.html');try{
    c.$('wizardNext').click();assert.equal(c.$('wizardError').hidden,false);
    for(let i=1;i<=5;i++){click(c.d,`.wizard-step[data-step="${i}"] .wizard-option`);c.$('wizardNext').click();}
    assert.equal(c.$('wizardResult').hidden,false);assert.match(c.$('recommendationTitle').textContent,/Conventional/);
    c.$('wizardBack').click();assert.equal(c.$('wizardResult').hidden,true);assert.equal(c.$('wizardNext').hidden,false);assert.deepEqual(c.errors,[]);
  }finally{c.close();}
});
test('worksheet: validation, acknowledgment, local result, no contact-data collection, and clear',async()=>{
  const c=await load('prequalify.html');try{
    c.$('prequalNext').click();assert.equal(c.$('prequalError').hidden,false);
    click(c.d,'[data-name="goal"]');c.$('prequalNext').click();click(c.d,'[data-name="timeline"]');c.$('prequalNext').click();
    c.$('prequalNext').click();assert.equal(c.$('creditRange').getAttribute('aria-invalid'),'true');
    c.$('creditRange').selectedIndex=1;c.$('downPayment').selectedIndex=1;c.$('prequalNext').click();c.$('propertyState').value='Washington';c.$('prequalNext').click();c.$('contactPreference').value='Email';
    assert.equal(c.$('fullName'),null);assert.equal(c.$('email'),null);assert.equal(c.$('phone'),null);
    c.$('prequalNext').click();assert.equal(c.$('consent').getAttribute('aria-invalid'),'true');
    c.$('consent').checked=true;c.$('prequalNext').click();assert.equal(c.$('prequalSuccess').hidden,false);assert.match(c.$('prequalSuccess').textContent,/Nothing has been submitted/);assert.match(c.$('inquirySummary').textContent,/State: Washington/);assert.match(c.$('inquirySummary').textContent,/Next step: Email the team/);assert.equal(c.w.localStorage.length,0);
    c.$('prequalBack').click();assert.equal(c.$('prequalSuccess').hidden,true);
    fill(c,'propertyCity','Fictional area');c.$('clearWorksheet').click();
    assert.equal(c.$('propertyCity').value,'');assert.equal(c.$('consent').checked,false);assert.equal(c.$('inquirySummary').children.length,0);
    assert.equal(c.d.querySelector('.prequal-step').hidden,false);assert.equal(c.d.querySelector('.prequal-option.selected'),null);assert.equal(c.w.localStorage.length,0);assert.deepEqual(c.errors,[]);
  }finally{c.close();}
});
test('inquiry cannot submit personal data when scripts are unavailable',()=>{
  const dom=new JSDOM(fs.readFileSync(path.join(root,'prequalify.html'),'utf8'));
  try { assert.ok([...dom.window.document.querySelectorAll('#prequalForm input,#prequalForm select,#prequalForm button')].every(control=>control.disabled)); }
  finally { dom.window.close(); }
});
test('checklist, glossary no-results and refinance non-savings states',async()=>{
  let c=await load('document-checklist.html');try{click(c.d,'.checklist input');assert.match(c.$('checklistCount').textContent,/^1 of/);c.$('resetChecklist').click();assert.match(c.$('checklistCount').textContent,/^0 of/);}finally{c.close();}
  c=await load('mortgage-glossary.html');try{fill(c,'glossarySearch','zzzz-unmatched');assert.match(c.$('glossaryCount').textContent,/No matching/);fill(c,'glossarySearch','');assert.doesNotMatch(c.$('glossaryCount').textContent,/No matching/);}finally{c.close();}
  c=await load('refinance-break-even.html');try{assert.equal(c.$('refiResult').textContent,'20 months');fill(c,'refiProposed','2600');assert.equal(c.$('refiResult').textContent,'No payment break-even');fill(c,'refiCost','-1');assert.equal(c.$('refiResult').textContent,'Check your inputs');}finally{c.close();}
});
