
document.addEventListener('DOMContentLoaded',()=>{
  const lightningData={
    conventional:{title:'Conventional',copy:'Explore conventional financing as a comparison path around your goals, property, down payment, and complete financial review.',points:['Discuss down-payment and documentation questions','Compare fixed and adjustable structures when available','Review the complete scenario with a licensed professional'],href:'conventional-loans.html',cta:'Explore This Loan Path'},
    first:{title:'First-Time Buyer',copy:'Build a clearer first-home plan by learning the down-payment, documentation, and program tradeoffs worth discussing.',points:['Map the major steps before shopping','Learn which questions to ask early','Open the First-Time Buyer Center'],href:'first-time-buyers.html',cta:'Open First-Time Buyer Center'},
    fha:{title:'FHA',copy:'Explore FHA as one possible path, subject to borrower, property, lender, and full eligibility review.',points:['Discuss down-payment considerations','Review property and borrower requirements','Compare FHA with other available paths'],href:'fha-loans.html',cta:'Explore This Loan Path'},
    usda:{title:'USDA',copy:'Explore whether a USDA path may be worth discussing for an eligible property and household; location, income, borrower, and lender requirements apply.',points:['Check whether the property area may qualify','Discuss household-income and occupancy requirements','Compare USDA with other available paths'],href:'usda-loans.html',cta:'Explore This Loan Path'},
    va:{title:'VA',copy:'Explore VA possibilities when military eligibility may apply; final eligibility and terms require documented review.',points:['Identify possible eligibility questions','Compare the VA path with alternatives','Review documentation with a licensed professional'],href:'va-loans.html',cta:'Explore This Loan Path'},
    jumbo:{title:'Jumbo',copy:'Discuss financing for loan amounts above current conforming limits; limits, pricing, and eligibility can change.',points:['Clarify the target property and loan size','Review reserve and documentation expectations','Compare available lender requirements'],href:'jumbo-loans.html',cta:'Explore This Loan Path'},
    investment:{title:'Investment Property',copy:'Frame an investment-property financing conversation around property use, cash flow, reserves, and lender requirements.',points:['Clarify property use and ownership goals','Review cash-flow and reserve questions','Compare qualifying program paths'],href:'investment-property.html',cta:'Explore This Loan Path'},
    refinance:{title:'Refinance',copy:'Compare refinance goals such as payment structure, term, or access to equity; costs and potential savings vary.',points:['Define the reason for refinancing','Compare costs with the intended benefit','Review the existing loan and current scenario'],href:'refinance.html',cta:'Explore This Loan Path'}
  };
  const lightningButtons=[...document.querySelectorAll('.lightning-node')];
  const lightningRoutes=[...document.querySelectorAll('.lightning-route')];
  const lightningStage=document.querySelector('.lightning-stage');
  const lightningTitle=document.getElementById('lightningTitle');
  const lightningCopy=document.getElementById('lightningCopy');
  const lightningPoints=document.getElementById('lightningPoints');
  const lightningCta=document.getElementById('lightningCta');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  let depthFrame=0;
  const resetLightningDepth=()=>{
    if(!lightningStage)return;
    if(depthFrame)cancelAnimationFrame(depthFrame);
    depthFrame=0;
    lightningStage.style.setProperty('--stage-rx','0deg');
    lightningStage.style.setProperty('--stage-ry','0deg');
    lightningStage.style.setProperty('--light-x','50%');
    lightningStage.style.setProperty('--light-y','50%');
  };
  const moveLightningDepth=event=>{
    if(!lightningStage||reducedMotion.matches||!finePointer.matches)return;
    const bounds=lightningStage.getBoundingClientRect();
    const x=Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width));
    const y=Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height));
    if(depthFrame)cancelAnimationFrame(depthFrame);
    depthFrame=requestAnimationFrame(()=>{
      lightningStage.style.setProperty('--stage-rx',`${((.5-y)*4.5).toFixed(2)}deg`);
      lightningStage.style.setProperty('--stage-ry',`${((x-.5)*6).toFixed(2)}deg`);
      lightningStage.style.setProperty('--light-x',`${(x*100).toFixed(1)}%`);
      lightningStage.style.setProperty('--light-y',`${(y*100).toFixed(1)}%`);
    });
  };
  const chargeLightning=()=>{
    if(!lightningStage||reducedMotion.matches)return;
    lightningStage.classList.remove('is-energizing');
    requestAnimationFrame(()=>requestAnimationFrame(()=>lightningStage.classList.add('is-energizing')));
  };
  const selectLightning=(key,charge=false)=>{
    const data=lightningData[key];
    if(!data||!lightningTitle||!lightningCopy||!lightningPoints||!lightningCta)return;
    lightningButtons.forEach(button=>{const selected=button.dataset.program===key;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});
    lightningRoutes.forEach(route=>route.classList.toggle('active',route.dataset.program===key));
    lightningTitle.textContent=data.title;
    lightningCopy.textContent=data.copy;
    lightningPoints.replaceChildren(...data.points.map(point=>{const item=document.createElement('li');item.textContent=point;return item}));
    lightningCta.href=data.href;
    lightningCta.textContent=data.cta;
    if(charge)chargeLightning();
  };
  lightningButtons.forEach(button=>{
    button.addEventListener('click',()=>selectLightning(button.dataset.program,true));
    button.addEventListener('focus',()=>selectLightning(button.dataset.program,true));
    button.addEventListener('pointerenter',()=>{if(finePointer.matches)selectLightning(button.dataset.program)});
  });
  lightningStage?.addEventListener('pointermove',moveLightningDepth,{passive:true});
  lightningStage?.addEventListener('pointerleave',resetLightningDepth);
  lightningStage?.addEventListener('animationend',event=>{if(event.animationName==='core-charge')lightningStage.classList.remove('is-energizing')});
  reducedMotion.addEventListener?.('change',resetLightningDepth);
  finePointer.addEventListener?.('change',resetLightningDepth);

  const finderAnswers={}; let finderStep=1;
  const steps=[...document.querySelectorAll('.loan-finder-step')];
  const result=document.getElementById('loanFinderResult');
  const back=document.getElementById('finderBack');
  const reset=document.getElementById('finderReset');
  function drawFinder(){
    steps.forEach(step=>{const active=Number(step.dataset.step)===finderStep;step.classList.toggle('active',active);step.hidden=!active});
    result.classList.toggle('active',finderStep===4);result.hidden=finderStep!==4;
    back.hidden=finderStep===1;reset.hidden=finderStep===1;
    const target=finderStep===4?result:steps[finderStep-1];
    const heading=target.querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true});
  }
  function showFinderResult(){
    const programs=[];
    if(finderAnswers.military==='yes')programs.push('VA');
    if(finderAnswers.goal!=='refi'&&finderAnswers.down==='zero'&&finderAnswers.military!=='yes')programs.push('USDA');
    if(finderAnswers.down==='low'||finderAnswers.goal==='first'||finderAnswers.goal==='refi')programs.push('FHA');
    programs.push('Conventional');
    document.getElementById('loanFinderTitle').textContent=programs.join(', ');
    document.getElementById('loanFinderCopy').textContent='Use these paths to prepare questions. Property, income, credit, occupancy, program, and lender requirements need a complete professional review.';
    const output=document.getElementById('finderLightningPrograms');output.replaceChildren();
    programs.forEach((program,index)=>{
      const button=document.createElement('button');button.type='button';button.className='finder-lightning-program';button.textContent=program;button.style.setProperty('--ignite-delay',index*120+'ms');
      button.setAttribute('aria-label','Explore the '+program+' path');
      button.addEventListener('click',()=>{
        const key=program.toLowerCase();selectLightning(key,true);
        document.getElementById('program-paths').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
        lightningButtons.find(button=>button.dataset.program===key)?.focus({preventScroll:true});
      });output.append(button);
    });
    const map=document.getElementById('finderLightningResult');map.hidden=false;map.classList.add('is-charged');
  }
  document.querySelectorAll('.finder-options button').forEach(button=>button.addEventListener('click',()=>{
    if(Number(button.closest('[data-step]').dataset.step)!==finderStep)return;
    finderAnswers[button.dataset.key]=button.dataset.value;
    button.closest('.finder-options').querySelectorAll('button').forEach(other=>{other.classList.toggle('selected',other===button);other.setAttribute('aria-pressed',String(other===button));});
    finderStep++;if(finderStep===4)showFinderResult();drawFinder();
  }));
  back.addEventListener('click',()=>{finderStep=Math.max(1,finderStep-1);drawFinder();});
  reset.addEventListener('click',()=>{Object.keys(finderAnswers).forEach(key=>delete finderAnswers[key]);finderStep=1;document.querySelectorAll('.finder-options button').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false')});drawFinder();});
  selectLightning('conventional');
});
