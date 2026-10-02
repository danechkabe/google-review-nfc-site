const stand = document.querySelector('.stand');
const model = document.querySelector('[data-model]');
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

const copyButton = document.querySelector('[data-copy]');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    copyButton.firstChild.textContent = 'Phone number copied ';
  } catch {
    copyButton.firstChild.textContent = '+380 67 457 5314 ';
  }
  window.setTimeout(() => { copyButton.firstChild.textContent = 'Copy phone number '; }, 2200);
});
document.getElementById('year').textContent = new Date().getFullYear();
