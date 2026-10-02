const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.attributes = {};
    this.listeners = {};
    this.style = { removeProperty() {} };
    this.classList = { add() {}, remove() {} };
    this.innerHTML = '';
    this.textContent = '';
  }

  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { this.listeners.click(); }
  querySelector() { return copyLabel; }
  setPointerCapture() {}
  hasPointerCapture() { return false; }
  releasePointerCapture() {}
}

const localStorage = {
  values: {},
  getItem(key) { return this.values[key] || null; },
  setItem(key, value) { this.values[key] = value; },
};
const i18n = [
  new Element({ i18n: 'hero-line-one' }),
  new Element({ i18n: 'hero-line-two' }),
  new Element({ i18n: 'contact-copy' }),
  new Element({ i18n: 'copy-phone' }),
];
const aria = [new Element({ i18nAriaLabel: 'language-selector' })];
const english = new Element({ language: 'en' });
const portuguese = new Element({ language: 'pt' });
const copyLabel = i18n[3];
const copyButton = new Element({ copy: '+380674575314' });
const model = new Element();
const document = {
  documentElement: { lang: 'en' },
  querySelector(selector) {
    return { '.stand': new Element(), '[data-model]': model, '[data-copy]': copyButton }[selector];
  },
  querySelectorAll(selector) {
    return {
      '[data-language]': [english, portuguese],
      '[data-i18n]': i18n,
      '[data-i18n-aria-label]': aria,
    }[selector] || [];
  },
  getElementById() { return new Element(); },
};

vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), {
  document,
  localStorage,
  navigator: { clipboard: { writeText: async () => {} } },
  window: { clearTimeout() {}, setTimeout() { return 1; } },
});

portuguese.click();
assert.equal(document.documentElement.lang, 'pt-PT');
assert.equal(i18n[0].innerHTML, 'Faça com que uma ótima');
assert.equal(i18n[1].innerHTML, 'avaliação pareça <em>natural.</em>');
assert.match(i18n[2].innerHTML, /forma moderna e simples/);
assert.equal(copyLabel.innerHTML, 'Copiar número de telefone');
assert.equal(portuguese.getAttribute('aria-pressed'), 'true');
assert.equal(english.getAttribute('aria-pressed'), 'false');
assert.equal(localStorage.getItem('site-language'), 'pt');

english.click();
assert.equal(document.documentElement.lang, 'en');
assert.equal(i18n[0].innerHTML, 'Make a great');
assert.equal(copyLabel.innerHTML, 'Copy phone number');
assert.equal(english.getAttribute('aria-pressed'), 'true');

console.log('Language switching behavior: PASS');
