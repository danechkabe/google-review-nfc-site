const stand = document.querySelector('.stand');
const model = document.querySelector('[data-model]');
const copyButton = document.querySelector('[data-copy]');
const languageButtons = document.querySelectorAll('[data-language]');
const copyLabel = copyButton.querySelector('[data-i18n="copy-phone"]');

const translations = {
  en: {
    'skip-to-contact': 'Skip to contact',
    'language-selector': 'Language selector',
    'get-in-touch': 'Get in touch',
    'nfc-review-experience': 'NFC review experience',
    'hero-line-one': 'Make a great',
    'hero-line-two': 'review feel <em>natural.</em>',
    'hero-lead': 'A simple, memorable way for guests to leave your business a Google review. No searching, no awkward prompts, and no printed QR codes everywhere.',
    'benefits-label': 'NFC review stand benefits',
    'benefit-one-title': 'People follow people',
    'benefit-one-copy': 'Guests often choose where to go based on other people’s experiences and ratings. More genuine positive reviews make that decision easier.',
    'benefit-two-title': 'Beyond a QR code',
    'benefit-two-copy': 'QR codes are everywhere. An NFC tap feels fresh and effortless, showing your guests that your business is modern.',
    'pricing-label': 'Pricing',
    'one-stand': '1 stand',
    'four-stands': '4 stands',
    'best-value': 'best value',
    'product-stage-label': 'Rotatable 3D model of a Google Review NFC table stand',
    'model-rotate-label': 'Rotate the review stand left or right',
    'contact-title-one': 'A better review',
    'contact-title-two': 'starts with a <em>tap.</em>',
    'contact-copy': 'Ready to give your guests a modern, effortless way to share their experience? Choose the contact method that works best for you.',
    'contact-person-label': 'Your NFC review stand',
    'copy-phone': 'Copy phone number',
    'phone-copied': 'Phone number copied',
  },
  pt: {
    'skip-to-contact': 'Ir para contacto',
    'language-selector': 'Seletor de idioma',
    'get-in-touch': 'Entrar em contacto',
    'nfc-review-experience': 'Experiência de avaliações com NFC',
    'hero-line-one': 'Faça com que uma ótima',
    'hero-line-two': 'avaliação pareça <em>natural.</em>',
    'hero-lead': 'Uma forma simples e memorável de os clientes deixarem uma avaliação do seu negócio no Google. Sem pesquisas, sem pedidos constrangedores e sem códigos QR impressos por todo o lado.',
    'benefits-label': 'Benefícios do suporte de avaliações NFC',
    'benefit-one-title': 'As pessoas seguem pessoas',
    'benefit-one-copy': 'Os clientes escolhem muitas vezes onde ir com base nas experiências e avaliações de outras pessoas. Mais avaliações positivas e genuínas tornam essa decisão mais fácil.',
    'benefit-two-title': 'Mais do que um código QR',
    'benefit-two-copy': 'Os códigos QR estão em todo o lado. Um toque NFC parece atual e simples, mostrando aos seus clientes que o seu negócio é moderno.',
    'pricing-label': 'Preços',
    'one-stand': '1 suporte',
    'four-stands': '4 suportes',
    'best-value': 'melhor oferta',
    'product-stage-label': 'Modelo 3D rotativo de um suporte de mesa NFC para avaliações no Google',
    'model-rotate-label': 'Rode o suporte de avaliações para a esquerda ou para a direita',
    'contact-title-one': 'Uma avaliação melhor',
    'contact-title-two': 'começa com um <em>toque.</em>',
    'contact-copy': 'Quer oferecer aos seus clientes uma forma moderna e simples de partilharem a experiência? Escolha a forma de contacto que funciona melhor para si.',
    'contact-person-label': 'O seu suporte NFC para avaliações',
    'copy-phone': 'Copiar número de telefone',
    'phone-copied': 'Número de telefone copiado',
  },
};

let language = 'en';

function setLanguage(nextLanguage) {
  if (!translations[nextLanguage]) return;
  language = nextLanguage;
  document.documentElement.lang = language === 'pt' ? 'pt-PT' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.innerHTML = translations[language][element.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    element.setAttribute('aria-label', translations[language][element.dataset.i18nAriaLabel]);
  });
  languageButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  localStorage.setItem('site-language', language);
}

languageButtons.forEach(button => {
  button.addEventListener('click', () => setLanguage(button.dataset.language));
});

try {
  setLanguage(localStorage.getItem('site-language') || 'en');
} catch {
  setLanguage('en');
}

let rotation = -18;
let startX = 0;
let startRotation = rotation;
let dragging = false;
let resumeTimer;

function showRotation() {
  stand.classList.remove('is-spinning');
  stand.style.transform = `rotateX(3deg) rotateY(${rotation}deg)`;
  model.setAttribute('aria-valuenow', String(Math.round(rotation)));
}

function resumeRotation() {
  window.clearTimeout(resumeTimer);
  resumeTimer = window.setTimeout(() => {
    if (!dragging) {
      stand.style.removeProperty('transform');
      stand.classList.add('is-spinning');
    }
  }, 1100);
}

model.addEventListener('pointerdown', event => {
  dragging = true;
  window.clearTimeout(resumeTimer);
  startX = event.clientX;
  startRotation = rotation;
  model.setPointerCapture(event.pointerId);
  showRotation();
});

model.addEventListener('pointermove', event => {
  if (!dragging) return;
  rotation = startRotation + (event.clientX - startX) * .8;
  showRotation();
});

function stopDrag(event) {
  if (!dragging) return;
  dragging = false;
  if (event?.pointerId !== undefined && model.hasPointerCapture(event.pointerId)) {
    model.releasePointerCapture(event.pointerId);
  }
  resumeRotation();
}

model.addEventListener('pointerup', stopDrag);
model.addEventListener('pointercancel', stopDrag);
model.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  window.clearTimeout(resumeTimer);
  rotation += event.key === 'ArrowLeft' ? -12 : 12;
  showRotation();
  resumeRotation();
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    copyLabel.textContent = translations[language]['phone-copied'];
  } catch {
    copyLabel.textContent = '+380 67 457 5314';
  }
  window.setTimeout(() => {
    copyLabel.textContent = translations[language]['copy-phone'];
  }, 2200);
});

document.getElementById('year').textContent = new Date().getFullYear();
