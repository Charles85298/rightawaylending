/* Shared, on-device interactions. No form values are sent or persisted. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const focusHeading = container => {
    const heading = container?.querySelector('h2,h3') || container;
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  };
  const root = document.documentElement;
  let stored;
  try { stored = localStorage.getItem('ral-theme'); } catch { /* Storage is optional. */ }
  if (['light', 'dark'].includes(stored)) root.dataset.theme = stored;
  function paintTheme() {
    if (!$('theme')) return;
    const dark = root.dataset.theme === 'dark';
    $('theme').textContent = dark ? '☾' : '☼';
    $('theme').setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    $('theme').setAttribute('aria-pressed', String(dark));
  }
  $('theme')?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ral-theme', root.dataset.theme); } catch { /* Continue without persistence. */ }
    paintTheme();
  });
  paintTheme();
  function setMenu(open) {
    $('mobilemenu')?.classList.toggle('open', open);
    $('menu')?.setAttribute('aria-expanded', String(open));
    $('menu')?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if ($('menu')) $('menu').textContent = open ? '×' : '☰';
  }
  $('menu')?.addEventListener('click', () => setMenu($('menu').getAttribute('aria-expanded') !== 'true'));
  all('#mobilemenu a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  function setQuickActions(open) {
    $('floatingMenu')?.classList.toggle('open', open);
    $('floatingToggle')?.setAttribute('aria-expanded', String(open));
    $('floatingToggle')?.setAttribute('aria-label', open ? 'Close quick actions' : 'Open quick actions');
    if ($('floatingToggle')) $('floatingToggle').textContent = open ? '×' : '+';
  }
  $('floatingToggle')?.addEventListener('click', () => setQuickActions($('floatingToggle').getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if ($('menu')?.getAttribute('aria-expanded') === 'true') { setMenu(false); $('menu').focus(); }
    if ($('floatingToggle')?.getAttribute('aria-expanded') === 'true') { setQuickActions(false); $('floatingToggle').focus(); }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) setMenu(false);
    if (!event.target.closest('.floating-actions')) setQuickActions(false);
  });

  // Content is visible without JavaScript; motion never gates readability.
  all('.reveal').forEach(element => element.classList.add('visible'));
  all('.metric-value').forEach(element => { element.textContent = element.dataset.count || element.textContent; });
  all('.faq-item').forEach(item => {
    const button = item.querySelector('button'), answer = item.querySelector('p');
    if (!button || !answer) return;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open)); answer.hidden = !open;
      if (button.querySelector('span')) button.querySelector('span').textContent = open ? '−' : '+';
    });
  });
  const exclusive = (buttons, selected) => buttons.forEach(button => {
    const active = button === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const journey = all('.journey-node');
  journey.forEach(button => button.addEventListener('click', () => {
    exclusive(journey, button); if ($('journeyDetail')) $('journeyDetail').textContent = button.dataset.copy;
  }));
  if (journey.length) exclusive(journey, journey[0]);
  if ($('miniPrice')) {
    function updateMini() {
      const price = Number($('miniPrice').value);
      $('miniDown').max = price;
      const down = Math.min(Number($('miniDown').value), price), rate = Number($('miniRate').value);
      $('miniDown').value = down;
      $('miniPriceValue').textContent = '$' + price.toLocaleString('en-US');
      $('miniDownValue').textContent = '$' + down.toLocaleString('en-US');
      $('miniRateValue').textContent = rate.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '%';
      $('miniPayment').textContent = '$' + Math.round(RalMath.monthlyPayment(price - down, rate, 30)).toLocaleString('en-US') + '/mo';
    }
    ['miniPrice', 'miniDown', 'miniRate'].forEach(id => $(id).addEventListener('input', updateMini));
    updateMini();
  }

  // Explicit Continue/Back controls prevent rapid clicks from skipping steps.
  function multiStep({ steps, next, back, result, error, progress, finish, validate, reset }) {
    if (!steps.length || !next || !back) return;
    let current = 0, completed = false;
    function draw(moveFocus = false) {
      steps.forEach((step, index) => {
        step.classList.toggle('active', !completed && index === current);
        step.hidden = completed || index !== current;
      });
      result.hidden = !completed; result.classList.toggle('active', completed);
      back.hidden = !completed && current === 0;
      next.hidden = completed;
      next.textContent = current === steps.length - 1 ? (next.dataset.finish || 'See My Results') : 'Continue';
      progress?.forEach((bar, index) => {
        bar.classList.toggle('active', completed || index <= current);
        if (index === current) bar.setAttribute('aria-current', 'step'); else bar.removeAttribute('aria-current');
      });
      if (error) { error.textContent = ''; error.hidden = true; }
      if (moveFocus) focusHeading(completed ? result : steps[current]);
    }
    function advance() {
      const step = steps[current];
      const message = validate ? validate(step, current) : (step.querySelector('.selected') ? '' : 'Choose an option to continue.');
      if (message) {
        error.textContent = message; error.hidden = false;
        const field = step.querySelector('[aria-invalid="true"],button,input,select');
        field?.focus(); return;
      }
      if (current < steps.length - 1) current++;
      else { completed = true; finish(); }
      draw(true);
    }
    next.addEventListener('click', advance);
    back.addEventListener('click', () => { if (completed) completed = false; else current = Math.max(0, current - 1); draw(true); });
    const form = next.closest('form');
    form?.addEventListener('submit', event => { event.preventDefault(); if (!completed) advance(); });
    reset?.addEventListener('click', () => {
      form.reset();
      all('[data-value]', form).forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); });
      all('[aria-invalid]', form).forEach(field => field.removeAttribute('aria-invalid'));
      $('inquirySummary')?.replaceChildren();
      current = 0; completed = false; draw(true);
      if ($('worksheetClearStatus')) $('worksheetClearStatus').textContent = 'Worksheet cleared. Nothing was sent to the team.';
    });
    steps.forEach(step => all('[data-value]', step).forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
      button.addEventListener('click', () => {
        all('[data-value]', step).forEach(option => {
          const selected = option === button;
          option.classList.toggle('selected', selected); option.setAttribute('aria-pressed', String(selected));
        });
        if (error) { error.hidden = true; error.textContent = ''; }
      });
    }));
    draw();
  }
  if ($('wizardNext')) {
    multiStep({ steps: all('.wizard-step'), next: $('wizardNext'), back: $('wizardBack'), result: $('wizardResult'), error: $('wizardError'), progress: all('#wizardProgress span'), finish() {
      const answers = Object.fromEntries(all('.wizard-option.selected').map(button => [button.dataset.key, button.dataset.value]));
      const programs = [], reasons = [];
      if (answers.jumbo === 'yes') { programs.push('Jumbo'); reasons.push('Discuss the proposed loan amount and applicable loan limits.'); }
      if (answers.military === 'yes' && answers.primary === 'yes') { programs.push('VA'); reasons.push('Possible military eligibility requires a documented review.'); }
      if (answers.rural === 'yes' && answers.primary === 'yes') { programs.push('USDA'); reasons.push('Property-area and household-income requirements need review.'); }
      if (answers.primary === 'yes' && answers.down === 'low') { programs.push('FHA'); reasons.push('Compare down-payment and mortgage-insurance considerations.'); }
      programs.push('Conventional');
      $('recommendationTitle').textContent = programs.join(', ');
      $('recommendationReason').textContent = reasons.join(' ') || 'Use conventional financing as a comparison point in a complete review.';
    } });
  }
  if ($('prequalForm')) {
    multiStep({ steps: all('.prequal-step'), next: $('prequalNext'), back: $('prequalBack'), result: $('prequalSuccess'), error: $('prequalError'), progress: all('.prequal-progress span'), reset: $('clearWorksheet'), validate(step, current) {
      if (current < 2) return step.querySelector('.selected') ? '' : 'Choose an option to continue.';
      let firstInvalid;
      all('input,select', step).forEach(field => {
        const valid = field.checkValidity() && (!field.required || field.type === 'checkbox' || field.value.trim().length > 0);
        field.toggleAttribute('aria-invalid', !valid);
        if (!valid) { field.setAttribute('aria-invalid', 'true'); firstInvalid ||= field; }
      });
      return firstInvalid ? `Please check ${document.querySelector(`label[for="${firstInvalid.id}"]`)?.textContent || 'the required field'}.` : '';
    }, finish() {
      const summary = $('inquirySummary'); summary.replaceChildren();
      const fields = [
        ['Goal', document.querySelector('[data-name="goal"].selected')?.dataset.value],
        ['Timeline', document.querySelector('[data-name="timeline"].selected')?.dataset.value],
        ['State', $('propertyState').value || 'To discuss'],
        ['Area', $('propertyCity').value || 'To discuss'],
        ['Next step', $('contactPreference').value === 'Email' ? 'Email the team to arrange a secure conversation. Do not include sensitive financial information.' : 'Call the team to arrange a secure conversation.']
      ];
      fields.forEach(([label, value]) => { const li = document.createElement('li'); li.textContent = `${label}: ${value}`; summary.append(li); });
    } });
    // Enable only after the local submit handler is attached. Without JavaScript,
    // this form cannot fall back to a GET request containing personal details.
    all('input,select,button', $('prequalForm')).forEach(control => { control.disabled = false; });
  }

  const checkboxes = all('.checklist input[type="checkbox"]');
  if (checkboxes.length) {
    const update = () => {
      const count = checkboxes.filter(box => box.checked).length;
      $('checklistProgress').value = count; $('checklistCount').textContent = `${count} of ${checkboxes.length} prepared`;
    };
    checkboxes.forEach(box => box.addEventListener('change', update));
    $('resetChecklist')?.addEventListener('click', () => { checkboxes.forEach(box => { box.checked = false; }); update(); });
    update();
  }
  if ($('glossarySearch')) {
    const cards = all('#glossaryGrid > *');
    const update = () => {
      const query = $('glossarySearch').value.trim().toLocaleLowerCase(); let count = 0;
      cards.forEach(card => { card.hidden = !card.textContent.toLocaleLowerCase().includes(query); if (!card.hidden) count++; });
      $('glossaryCount').textContent = count ? `${count} terms found` : 'No matching terms. Try a shorter word or clear the search.';
    };
    $('glossarySearch').addEventListener('input', update); update();
  }
  if ($('refinanceForm')) {
    const update = () => {
      const fields = ['refiCost','refiCurrent','refiProposed'].map($);
      const invalid = fields.some(field => field.value === '' || !field.checkValidity());
      const result = invalid ? null : RalMath.breakEven(...fields.map(field => Number(field.value)));
      $('refiResult').textContent = invalid ? 'Check your inputs' : result ? `${result.months} months` : 'No payment break-even';
      $('refiSummary').textContent = invalid ? 'Enter nonnegative amounts for all three fields.' : result ? `At $${result.savings.toLocaleString('en-US')} less per month, these costs are recovered in approximately ${(result.months / 12).toFixed(1)} years. This does not measure total interest or the effect of changing the loan term.` : 'The proposed payment must be lower to recover costs through monthly payment savings.';
    };
    all('input', $('refinanceForm')).forEach(field => field.addEventListener('input', update));
    $('refinanceForm').addEventListener('submit', event => { event.preventDefault(); update(); }); update();
  }
  all('[data-print-page]').forEach(button => button.addEventListener('click', () => window.print()));
  all('.help-tip').forEach(button => {
    button.setAttribute('aria-label', button.dataset.tooltip);
    button.addEventListener('click', () => button.classList.toggle('show-help'));
  });
});
