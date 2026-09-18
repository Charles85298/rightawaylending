document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id);
 if(!$('affordTab')) return;
 const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
 const sliders=['monthlyIncome','monthlyDebt','housingRatio','totalRatio','affordInterestRate','affordLoanTerm','affordMonthlyHoa','affordMonthlyTax','affordMonthlyInsurance','affordMonthlyMI','homePrice','downPayment','interestRate','loanTerm','propertyTaxRate','annualInsurance','monthlyHoa','pmiRate'];

 function val(id){return Number($(id)?.value)||0}
 function paint(el){if(!el)return;const p=((+el.value-+el.min)/(+el.max-+el.min))*100;el.style.setProperty('--range-progress',p+'%')}
 const monthlyPayment = RalMath.monthlyPayment;
 const supportedPrincipal = RalMath.supportedPrincipal;

 function setMode(mode){
  const afford=mode==='afford';
  $('affordTab').classList.toggle('active',afford);$('paymentTab').classList.toggle('active',!afford);
  $('affordTab').setAttribute('aria-selected',String(afford));$('paymentTab').setAttribute('aria-selected',String(!afford));
  $('affordPanel').hidden=!afford;$('paymentPanel').hidden=afford;
  $('affordPanel').classList.toggle('active',afford);$('paymentPanel').classList.toggle('active',!afford);
  $('affordTab').tabIndex=afford?0:-1;$('paymentTab').tabIndex=afford?-1:0;
  update();
 }

 function update(){
  sliders.forEach(id=>paint($(id)));
  if($('affordTab').classList.contains('active')){
   const income=val('monthlyIncome'), debt=val('monthlyDebt'), h=val('housingRatio')/100, t=val('totalRatio')/100;
   const grossHousingBudget=Math.max(0,Math.min(income*h,income*t-debt));
   const affordHoa=val('affordMonthlyHoa');
   const expenses=val('affordMonthlyTax')+val('affordMonthlyInsurance')+val('affordMonthlyMI');
   const budget=Math.max(0,grossHousingBudget-affordHoa-expenses);
   const rate=val('affordInterestRate'), term=val('affordLoanTerm')||30;
   $('monthlyIncomeValue').textContent=money.format(income);$('monthlyDebtValue').textContent=money.format(debt);
   $('housingRatioValue').textContent=Math.round(h*100)+'%';$('totalRatioValue').textContent=Math.round(t*100)+'%';$('affordInterestRateValue').textContent=rate.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'%';$('affordLoanTermValue').textContent=term+' years';$('affordMonthlyHoaValue').textContent=money.format(affordHoa);
   ['affordMonthlyTax','affordMonthlyInsurance','affordMonthlyMI'].forEach(id=>$(id+'Value').textContent=money.format(val(id)));
   $('resultKicker').textContent='Illustrative principal & interest budget';$('primaryResult').innerHTML=money.format(budget)+'<span>/mo</span>';
   $('resultSummary').textContent='Estimated taxes, insurance, mortgage insurance, and HOA dues have been subtracted from the housing budget. This is a planning estimate, not an approved loan amount.';
   $('paymentBreakdown').hidden=true;$('paymentBreakdown').style.display='none';$('chartWrap').hidden=true;$('chartWrap').style.display='none';
   $('secondaryLabelOne').textContent='Illustrative principal supported';$('secondaryResultOne').textContent=money.format(supportedPrincipal(budget,rate,term));
   $('secondaryLabelTwo').textContent='Illustrative rate used';$('secondaryResultTwo').textContent=rate.toFixed(2)+'%';
   $('secondaryLabelThree').textContent='Illustrative term';$('secondaryResultThree').textContent=term+' years';
  } else {
   const price=val('homePrice');let down=Math.min(val('downPayment'),price);$('downPayment').max=price;$('downPayment').value=down;$('downPaymentMax').textContent=money.format(price);
   const principal=price-down,rate=val('interestRate'),term=val('loanTerm'),tax=price*(val('propertyTaxRate')/100)/12,ins=val('annualInsurance')/12,hoa=val('monthlyHoa'),pmi=principal*(val('pmiRate')/100)/12;
   const pi=monthlyPayment(principal,rate,term), total=pi+tax+ins+pmi+hoa, totalInterest=Math.max(0,pi*term*12-principal);
   $('homePriceValue').textContent=money.format(price);$('downPaymentValue').textContent=money.format(down)+' ('+(price?Math.round(down/price*100):0)+'%)';
   $('interestRateValue').textContent=rate.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+'%';$('loanTermValue').textContent=term+' years';
   $('propertyTaxRateValue').textContent=val('propertyTaxRate').toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'%';$('annualInsuranceValue').textContent=money.format(val('annualInsurance'));$('monthlyHoaValue').textContent=money.format(hoa);$('pmiRateValue').textContent=val('pmiRate').toFixed(2)+'%';
   $('resultKicker').textContent='Estimated monthly housing payment';$('primaryResult').innerHTML=money.format(total)+'<span>/mo</span>';$('resultSummary').textContent='Estimated principal, interest, taxes, insurance, mortgage insurance, and HOA dues.';
   $('paymentBreakdown').hidden=false;$('paymentBreakdown').style.display='grid';$('chartWrap').hidden=false;$('chartWrap').style.display='flex';$('donutTotal').textContent=money.format(total);
   $('piResult').textContent=money.format(pi);$('taxResult').textContent=money.format(tax);$('insuranceResult').textContent=money.format(ins);$('pmiResult').textContent=money.format(pmi);$('hoaResult').textContent=money.format(hoa);
   const p1=total?pi/total*100:0,p2=total?tax/total*100:0,p3=total?ins/total*100:0,p4=total?pmi/total*100:0;
   $('paymentDonut').style.background=`conic-gradient(#D32632 0 ${p1}%,#00A8F0 ${p1}% ${p1+p2}%,#AFC4D6 ${p1+p2}% ${p1+p2+p3}%,#467397 ${p1+p2+p3}% ${p1+p2+p3+p4}%,#102D49 ${p1+p2+p3+p4}% 100%)`;
   $('secondaryLabelOne').textContent='Estimated loan amount';$('secondaryResultOne').textContent=money.format(principal);
   $('secondaryLabelTwo').textContent='Estimated total interest';$('secondaryResultTwo').textContent=money.format(totalInterest);
   $('secondaryLabelThree').textContent='Down payment percentage';$('secondaryResultThree').textContent=(price?(down/price*100).toFixed(1):0)+'%';
  }
 }

 function add(container,label,value){const d=document.createElement('div');d.innerHTML=`<span>${label}</span><strong>${value}</strong>`;container.appendChild(d)}
 function buildReport(){
  const afford=$('affordTab').classList.contains('active'), inputs=$('pdfInputs'), details=$('pdfDetails');inputs.innerHTML='';details.innerHTML='';
  $('pdfDate').textContent=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});$('pdfMode').textContent=afford?'How much can I afford?':'Estimate my payment';
  if(afford){add(inputs,'Gross monthly income',$('monthlyIncomeValue').textContent);add(inputs,'Monthly debts',$('monthlyDebtValue').textContent);add(inputs,'Housing ratio',$('housingRatioValue').textContent);add(inputs,'Total debt ratio',$('totalRatioValue').textContent);add(inputs,'Illustrative interest rate',$('affordInterestRateValue').textContent);add(inputs,'Loan term',$('affordLoanTermValue').textContent);add(inputs,'Monthly HOA dues',$('affordMonthlyHoaValue').textContent);['affordMonthlyTax','affordMonthlyInsurance','affordMonthlyMI'].forEach(id=>add(inputs,document.querySelector('label[for='+id+']').textContent,$(id+'Value').textContent))}
  else{add(inputs,'Home price',$('homePriceValue').textContent);add(inputs,'Down payment',$('downPaymentValue').textContent);add(inputs,'Interest rate',$('interestRateValue').textContent);add(inputs,'Loan term',$('loanTermValue').textContent);add(inputs,'Property tax rate',$('propertyTaxRateValue').textContent);add(inputs,'Annual insurance',$('annualInsuranceValue').textContent);add(inputs,'Monthly HOA',$('monthlyHoaValue').textContent);add(inputs,'Mortgage insurance rate',$('pmiRateValue').textContent)}
  $('pdfPrimaryLabel').textContent=$('resultKicker').textContent;$('pdfPrimaryValue').textContent=$('primaryResult').textContent;$('pdfPrimarySummary').textContent=$('resultSummary').textContent;
  if (!afford) for (const [label,id] of [['Principal & interest','piResult'],['Property taxes','taxResult'],['Homeowners insurance','insuranceResult'],['Mortgage insurance','pmiResult'],['HOA dues','hoaResult']]) add(details,label,$(id).textContent);
  add(details,$('secondaryLabelOne').textContent,$('secondaryResultOne').textContent);add(details,$('secondaryLabelTwo').textContent,$('secondaryResultTwo').textContent);add(details,$('secondaryLabelThree').textContent,$('secondaryResultThree').textContent);
 }
 $('affordTab').addEventListener('click',()=>setMode('afford'));$('paymentTab').addEventListener('click',()=>setMode('payment'));sliders.forEach(id=>$(id)?.addEventListener('input',update));
 $('savePdfButton').addEventListener('click',()=>{buildReport();document.body.classList.add('printing-calculator-report');window.print()});window.addEventListener('afterprint',()=>document.body.classList.remove('printing-calculator-report'));
 ['affordTab','paymentTab'].forEach(id=>$(id).addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const afford=event.key==='Home'||(event.key!=='End'&&id==='paymentTab');setMode(afford?'afford':'payment');$(afford?'affordTab':'paymentTab').focus();}}));
 window.addEventListener('beforeprint',buildReport);
 update();
});
