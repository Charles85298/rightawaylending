(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RalMath = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const valid = values => values.every(value => Number.isFinite(value) && value >= 0);
  function monthlyPayment(principal, annualRate, years) {
    if (!valid([principal, annualRate, years]) || years === 0) return 0;
    const months = years * 12, rate = annualRate / 1200;
    return rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
  }
  function supportedPrincipal(payment, annualRate, years) {
    if (!valid([payment, annualRate, years]) || years === 0) return 0;
    const months = years * 12, rate = annualRate / 1200;
    return rate === 0 ? payment * months : payment * (1 - Math.pow(1 + rate, -months)) / rate;
  }
  function breakEven(costs, currentPayment, proposedPayment) {
    if (!valid([costs, currentPayment, proposedPayment])) return null;
    const savings = currentPayment - proposedPayment;
    return savings > 0 ? { savings, months: Math.ceil(costs / savings) } : null;
  }
  return Object.freeze({ monthlyPayment, supportedPrincipal, breakEven });
});
