const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'assets/site-config.json')));
const companyURL='https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/2412327';
const problems=[];
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8')),d=dom.window.document,footer=d.querySelector('body > footer');
 const fail=s=>problems.push(`${file}: ${s}`);
 for(const s of ['Right Away Lending Corp','Company NMLS #2412327','Equal Housing Opportunity','MB-1043256','MBR6277','FL0024815','SR0025356','CL-2412327',...config.servedStates]) if(!footer?.textContent.includes(s))fail('Missing public disclosure: '+s);
 if(![...footer.querySelectorAll('a')].some(a=>a.href===companyURL&&a.textContent==='NMLS Consumer Access'))fail('Missing company-specific NMLS Consumer Access link');
 if(![...footer.querySelectorAll('a')].some(a=>a.getAttribute('href').endsWith('licensing.html#texas-complaints')))fail('Missing Texas notice link');
 const text=(d.querySelector('main')?.textContent||'')+' '+d.head.textContent;
 if(/placeholder policy|pending legal|must be inserted|final contact methods|Get Pre-Qualified \|/i.test(text))fail('Unfinished or misleading disclosure copy');
 if(d.querySelector('a[href^="sms:"]'))fail('SMS is not part of the approved workflow');
 if(file==='index.html'&&(d.querySelector('[data-rate],#snapshotPayment,#miniPayment')||/6\.50%|\$2,402/.test(text)))fail('Promotional sample rate/payment remains');
 if(file==='prequalify.html'){
  if(d.querySelector('#fullName,#email,#phone'))fail('Worksheet must not collect unnecessary contact identity');
  if(!d.querySelector('#clearWorksheet')||!text.includes('Nothing has been submitted'))fail('Worksheet needs clear/reset and honest completion');
  for(const s of config.servedStates)if(![...d.querySelectorAll('#propertyState option')].some(o=>o.textContent===s))fail('Missing state selection '+s);
 }
 if(file==='licensing.html')for(const s of ['TEXAS RESIDENTS:','2601 N. LAMAR','1-877-276-5550','MB-1043256','MBR6277','FL0024815','SR0025356','CL-2412327'])if(!text.includes(s))fail('Missing license or Texas notice content '+s);
 dom.window.close();
}
const pdf=fs.readFileSync(path.join(root,'assets/texas-consumer-complaint-notice.pdf'));
if(crypto.createHash('sha256').update(pdf).digest('hex')!=='372257d29e911c50dbdf56c39e1865d0224c9a4a53f333645997aaab25608895')problems.push('Official Texas notice changed; re-verify its source and content.');
if(config.inquiryMode!=='on-device'||config.schedulingMode!=='direct-contact'||config.analyticsEnabled!==false)problems.push('Contact/privacy model changed; disclosures must be reviewed.');
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log('PASS: company/state identity, NMLS links, Texas notice, rate-promotion removal, and direct-contact worksheet disclosures. This is a content regression check, not legal certification.');
