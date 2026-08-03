
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.documentElement;
 const theme=document.getElementById('theme');
 const menu=document.getElementById('menu');
 const mobile=document.getElementById('mobilemenu');
 const stored=localStorage.getItem('ral-theme');
 if(stored){root.dataset.theme=stored;if(theme)theme.textContent=stored==='dark'?'☾':'☼'}
 theme?.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;localStorage.setItem('ral-theme',next);theme.textContent=next==='dark'?'☾':'☼'});
 menu?.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});

 const $=id=>document.getElementById(id);
 if(!$('affordTab')) return;
 const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
 const sliders=['monthlyIncome','monthlyDebt','housingRatio','totalRatio','affordInterestRate','affordLoanTerm','affordMonthlyHoa','homePrice','downPayment','interestRate','loanTerm','propertyTaxRate','annualInsurance','monthlyHoa','pmiRate'];

 function val(id){return Number($(id)?.value)||0}
 function paint(el){if(!el)return;const p=((+el.value-+el.min)/(+el.max-+el.min))*100;el.style.setProperty('--range-progress',p+'%')}
 function monthlyPayment(p,r,y){const n=y*12,m=(r/100)/12;return m?p*(m*Math.pow(1+m,n))/(Math.pow(1+m,n)-1):p/n}
 function supportedPrincipal(pay,r,y){const n=y*12,m=(r/100)/12;return m?pay*(Math.pow(1+m,n)-1)/(m*Math.pow(1+m,n)):pay*n}

 function setMode(mode){
  const afford=mode==='afford';
  $('affordTab').classList.toggle('active',afford);$('paymentTab').classList.toggle('active',!afford);
  $('affordTab').setAttribute('aria-selected',String(afford));$('paymentTab').setAttribute('aria-selected',String(!afford));
  $('affordPanel').hidden=!afford;$('paymentPanel').hidden=afford;
  $('affordPanel').classList.toggle('active',afford);$('paymentPanel').classList.toggle('active',!afford);
  update();
 }

 function update(){
  sliders.forEach(id=>paint($(id)));
  if($('affordTab').classList.contains('active')){
   const income=val('monthlyIncome'), debt=val('monthlyDebt'), h=val('housingRatio')/100, t=val('totalRatio')/100;
   const grossHousingBudget=Math.max(0,Math.min(income*h,income*t-debt));
   const affordHoa=val('affordMonthlyHoa');
   const budget=Math.max(0,grossHousingBudget-affordHoa);
   const rate=val('affordInterestRate')||6.5, term=val('affordLoanTerm')||30;
   $('monthlyIncomeValue').textContent=money.format(income);$('monthlyDebtValue').textContent=money.format(debt);
   $('housingRatioValue').textContent=Math.round(h*100)+'%';$('totalRatioValue').textContent=Math.round(t*100)+'%';$('affordInterestRateValue').textContent=rate.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'%';$('affordLoanTermValue').textContent=term+' years';$('affordMonthlyHoaValue').textContent=money.format(affordHoa);
   $('resultKicker').textContent='Illustrative affordability result';$('primaryResult').innerHTML=money.format(budget)+'<span>/mo</span>';
   $('resultSummary').textContent=affordHoa>0?'The selected HOA dues have been subtracted from the illustrative monthly housing budget.':'This is the lower of the selected housing and total debt ratio results.';
   $('paymentBreakdown').hidden=true;$('paymentBreakdown').style.display='none';$('chartWrap').hidden=true;$('chartWrap').style.display='none';
   $('secondaryLabelOne').textContent='Illustrative principal supported';$('secondaryResultOne').textContent=money.format(supportedPrincipal(budget,rate,term));
   $('secondaryLabelTwo').textContent='Illustrative rate used';$('secondaryResultTwo').textContent=rate.toFixed(2)+'%';
   $('secondaryLabelThree').textContent='Illustrative term';$('secondaryResultThree').textContent=term+' years';
  } else {
   const price=val('homePrice');let down=Math.min(val('downPayment'),price);$('downPayment').max=price;$('downPaymentMax').textContent=money.format(price);
   const principal=price-down,rate=val('interestRate'),term=val('loanTerm'),tax=price*(val('propertyTaxRate')/100)/12,ins=val('annualInsurance')/12,hoa=val('monthlyHoa'),pmi=principal*(val('pmiRate')/100)/12;
   const pi=monthlyPayment(principal,rate,term), total=pi+tax+ins+pmi+hoa, totalInterest=Math.max(0,pi*term*12-principal);
   $('homePriceValue').textContent=money.format(price);$('downPaymentValue').textContent=money.format(down)+' ('+(price?Math.round(down/price*100):0)+'%)';
   $('interestRateValue').textContent=rate.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'%';$('loanTermValue').textContent=term+' years';
   $('propertyTaxRateValue').textContent=val('propertyTaxRate').toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'%';$('annualInsuranceValue').textContent=money.format(val('annualInsurance'));$('monthlyHoaValue').textContent=money.format(hoa);$('pmiRateValue').textContent=val('pmiRate').toFixed(2)+'%';
   $('resultKicker').textContent='Estimated monthly housing payment';$('primaryResult').innerHTML=money.format(total)+'<span>/mo</span>';$('resultSummary').textContent='Estimated principal, interest, taxes, insurance, mortgage insurance, and HOA dues.';
   $('paymentBreakdown').hidden=false;$('paymentBreakdown').style.display='grid';$('chartWrap').hidden=false;$('chartWrap').style.display='flex';$('donutTotal').textContent=money.format(total);
   $('piResult').textContent=money.format(pi);$('taxResult').textContent=money.format(tax);$('insuranceResult').textContent=money.format(ins);$('pmiResult').textContent=money.format(pmi);$('hoaResult').textContent=money.format(hoa);
   const p1=pi/total*100,p2=tax/total*100,p3=ins/total*100,p4=pmi/total*100;
   $('paymentDonut').style.background=`conic-gradient(#69BE28 0 ${p1}%,#56a4e8 ${p1}% ${p1+p2}%,#f4a300 ${p1+p2}% ${p1+p2+p3}%,#c89cff ${p1+p2+p3}% ${p1+p2+p3+p4}%,#ff8b7b ${p1+p2+p3+p4}% 100%)`;
   $('secondaryLabelOne').textContent='Estimated loan amount';$('secondaryResultOne').textContent=money.format(principal);
   $('secondaryLabelTwo').textContent='Estimated total interest';$('secondaryResultTwo').textContent=money.format(totalInterest);
   $('secondaryLabelThree').textContent='Down payment percentage';$('secondaryResultThree').textContent=(price?(down/price*100).toFixed(1):0)+'%';
  }
 }

 function add(container,label,value){const d=document.createElement('div');d.innerHTML=`<span>${label}</span><strong>${value}</strong>`;container.appendChild(d)}
 function buildReport(){
  const afford=$('affordTab').classList.contains('active'), inputs=$('pdfInputs'), details=$('pdfDetails');inputs.innerHTML='';details.innerHTML='';
  $('pdfDate').textContent=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});$('pdfMode').textContent=afford?'How much can I afford?':'Estimate my payment';
  if(afford){add(inputs,'Gross monthly income',$('monthlyIncomeValue').textContent);add(inputs,'Monthly debts',$('monthlyDebtValue').textContent);add(inputs,'Housing ratio',$('housingRatioValue').textContent);add(inputs,'Total debt ratio',$('totalRatioValue').textContent);add(inputs,'Illustrative interest rate',$('affordInterestRateValue').textContent);add(inputs,'Loan term',$('affordLoanTermValue').textContent);add(inputs,'Monthly HOA dues',$('affordMonthlyHoaValue').textContent)}
  else{add(inputs,'Home price',$('homePriceValue').textContent);add(inputs,'Down payment',$('downPaymentValue').textContent);add(inputs,'Interest rate',$('interestRateValue').textContent);add(inputs,'Loan term',$('loanTermValue').textContent);add(inputs,'Property tax rate',$('propertyTaxRateValue').textContent);add(inputs,'Annual insurance',$('annualInsuranceValue').textContent);add(inputs,'Monthly HOA',$('monthlyHoaValue').textContent);add(inputs,'Mortgage insurance rate',$('pmiRateValue').textContent)}
  $('pdfPrimaryLabel').textContent=$('resultKicker').textContent;$('pdfPrimaryValue').textContent=$('primaryResult').textContent;$('pdfPrimarySummary').textContent=$('resultSummary').textContent;
  add(details,$('secondaryLabelOne').textContent,$('secondaryResultOne').textContent);add(details,$('secondaryLabelTwo').textContent,$('secondaryResultTwo').textContent);add(details,$('secondaryLabelThree').textContent,$('secondaryResultThree').textContent);
 }
 $('affordTab').addEventListener('click',()=>setMode('afford'));$('paymentTab').addEventListener('click',()=>setMode('payment'));sliders.forEach(id=>$(id)?.addEventListener('input',update));
 $('savePdfButton').addEventListener('click',()=>{buildReport();document.body.classList.add('printing-calculator-report');window.print()});window.addEventListener('afterprint',()=>document.body.classList.remove('printing-calculator-report'));
 update();
});


document.addEventListener('DOMContentLoaded',()=>{
 const steps=[...document.querySelectorAll('.wizard-step')];
 if(!steps.length) return;
 const answers={}; let current=1;
 const back=document.getElementById('wizardBack'),next=document.getElementById('wizardNext'),result=document.getElementById('wizardResult');
 const progress=[...document.querySelectorAll('#wizardProgress span')];

 function draw(){
  steps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===current));
  progress.forEach((p,i)=>p.classList.toggle('active',i<current));
  back.hidden=current===1;
  next.textContent=current===5?'See My Results':'Continue';
 }
 document.querySelectorAll('.wizard-option').forEach(btn=>{
  btn.addEventListener('click',()=>{
   btn.closest('.wizard-options').querySelectorAll('.wizard-option').forEach(x=>x.classList.remove('selected'));
   btn.classList.add('selected');answers[btn.dataset.key]=btn.dataset.value;
  });
 });
 function showResult(){
  steps.forEach(s=>s.classList.remove('active'));result.classList.add('active');next.hidden=true;back.hidden=false;
  let programs=[],reasons=[];
  if(answers.jumbo==='yes'){programs.push('Jumbo');reasons.push('The expected loan amount may be above conforming limits.');}
  if(answers.military==='yes'&&answers.primary==='yes'){programs.push('VA');reasons.push('Possible VA eligibility may be worth reviewing.');}
  if(answers.rural==='yes'&&answers.primary==='yes'){programs.push('USDA');reasons.push('The location and household may be worth checking for USDA eligibility.');}
  if(answers.primary==='yes'&&answers.down==='low'){programs.push('FHA');reasons.push('A lower down payment and FHA qualification features may be worth comparing.');}
  programs.push('Conventional');reasons.push('Conventional financing is broadly used and may provide a useful comparison point.');
  programs=[...new Set(programs)];
  document.getElementById('recommendationTitle').textContent=programs.slice(0,3).join(', ');
  document.getElementById('recommendationReason').textContent=reasons.join(' ');
 }
 next.addEventListener('click',()=>{if(!steps[current-1].querySelector('.selected')) return;if(current<5){current++;draw()}else showResult()});
 back.addEventListener('click',()=>{if(result.classList.contains('active')){result.classList.remove('active');next.hidden=false;current=5;draw()}else if(current>1){current--;draw()}});
 draw();
});


document.addEventListener('DOMContentLoaded',()=>{
  const snapshotButtons=[...document.querySelectorAll('.snapshot-program')];
  const snapshotPayment=document.getElementById('snapshotPayment');
  const snapshotRing=document.querySelector('.snapshot-ring strong');
  snapshotButtons.forEach(btn=>btn.addEventListener('click',()=>{
    snapshotButtons.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    if(snapshotPayment) snapshotPayment.textContent='$'+Number(btn.dataset.payment).toLocaleString('en-US');
    if(snapshotRing) snapshotRing.textContent=Number(btn.dataset.rate).toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'%';
  }));

  const metrics=[...document.querySelectorAll('.metric-value')];
  const revealElements=[...document.querySelectorAll('.reveal')];
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if(entry.target.classList.contains('metric-card')){
        const el=entry.target.querySelector('.metric-value');
        if(el && !el.dataset.done){
          el.dataset.done='true';
          const target=Number(el.dataset.count)||0;
          let value=0;
          const step=Math.max(1,Math.ceil(target/35));
          const timer=setInterval(()=>{value=Math.min(target,value+step);el.textContent=value+(target===100?'%':target===24?' hrs':'');if(value>=target)clearInterval(timer)},32);
        }
      }
      observer.unobserve(entry.target);
    });
  },{threshold:.16});
  revealElements.forEach(el=>observer.observe(el));
  document.querySelectorAll('.metric-card').forEach(el=>observer.observe(el));

  const finderSteps=[...document.querySelectorAll('.loan-finder-step')];
  const finderResult=document.getElementById('loanFinderResult');
  const finderTitle=document.getElementById('loanFinderTitle');
  const finderCopy=document.getElementById('loanFinderCopy');
  const answers={}; let step=1;
  document.querySelectorAll('.finder-options button').forEach(btn=>btn.addEventListener('click',()=>{
    btn.closest('.finder-options').querySelectorAll('button').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');answers[btn.dataset.key]=btn.dataset.value;
    setTimeout(()=>{
      if(step<3){step++;finderSteps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step))}
      else{
        finderSteps.forEach(s=>s.classList.remove('active'));finderResult.classList.add('active');
        let programs=['Conventional'],reasons=[];
        if(answers.military==='yes'){programs.unshift('VA');reasons.push('Possible military eligibility makes VA worth reviewing.')}
        if(answers.down==='zero' && answers.military!=='yes'){programs.unshift('USDA');reasons.push('Zero-down possibilities may be worth discussing, subject to area and income eligibility.')}
        if((answers.down==='low'||answers.goal==='first') && answers.military!=='yes'){programs.unshift('FHA');reasons.push('A lower down payment and FHA qualification features may be worth comparing.')}
        if(answers.goal==='refi'){programs=['Conventional','FHA','VA'];reasons=['Refinance options depend on the current loan, equity, eligibility, and financial goals.']}
        finderTitle.textContent=[...new Set(programs)].slice(0,3).join(', ');
        finderCopy.textContent=reasons.join(' ') || 'Conventional financing provides a useful comparison point for many borrowers.';
      }
    },180);
  }));

  const journeyDetail=document.getElementById('journeyDetail');
  document.querySelectorAll('.journey-node').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.journey-node').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');if(journeyDetail)journeyDetail.textContent=btn.dataset.copy;
  }));

  const miniIds=['miniPrice','miniDown','miniRate'];
  const payment=(p,r,n=360)=>{const m=(r/100)/12;return m?p*(m*Math.pow(1+m,n))/(Math.pow(1+m,n)-1):p/n};
  function updateMini(){
    const price=Number(document.getElementById('miniPrice')?.value)||0;
    const down=Math.min(Number(document.getElementById('miniDown')?.value)||0,price);
    const rate=Number(document.getElementById('miniRate')?.value)||0;
    document.getElementById('miniPriceValue').textContent='$'+price.toLocaleString('en-US');
    document.getElementById('miniDownValue').textContent='$'+down.toLocaleString('en-US');
    document.getElementById('miniRateValue').textContent=rate.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'%';
    document.getElementById('miniPayment').textContent='$'+Math.round(payment(price-down,rate)).toLocaleString('en-US')+'/mo';
  }
  miniIds.forEach(id=>document.getElementById(id)?.addEventListener('input',updateMini));updateMini();

  const slides=[...document.querySelectorAll('.testimonial-slide')];let slide=0;
  function showSlide(i){slides.forEach((s,n)=>s.classList.toggle('active',n===i))}
  document.getElementById('testimonialNext')?.addEventListener('click',()=>{slide=(slide+1)%slides.length;showSlide(slide)});
  document.getElementById('testimonialPrev')?.addEventListener('click',()=>{slide=(slide-1+slides.length)%slides.length;showSlide(slide)});

  const floatingToggle=document.getElementById('floatingToggle'),floatingMenu=document.getElementById('floatingMenu');
  floatingToggle?.addEventListener('click',()=>{const open=floatingMenu.classList.toggle('open');floatingToggle.setAttribute('aria-expanded',String(open));floatingToggle.textContent=open?'×':'+'});
});
