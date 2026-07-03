(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const successBox = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const setInvalid = (input, invalid) => {
    if (invalid) input.classList.add('invalid');
    else input.classList.remove('invalid');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    [name, email, message].forEach((el) => setInvalid(el, false));

    let ok = true;
    if (!name.value.trim()) { setInvalid(name, true); ok = false; }
    if (!isValidEmail(email.value)) { setInvalid(email, true); ok = false; }
    if (message.value.trim().length < 5) { setInvalid(message, true); ok = false; }
    if (!ok) return;

    const subject = encodeURIComponent(`Demande Quelto — ${name.value.trim()}`);
    const body = encodeURIComponent(
      `Nom : ${name.value.trim()}\n` +
      `${form.querySelector('#company').value ? 'Activité : ' + form.querySelector('#company').value.trim() + '\n' : ''}` +
      `${form.querySelector('#phone').value ? 'Tél : ' + form.querySelector('#phone').value.trim() + '\n' : ''}` +
      `Email : ${email.value.trim()}\n\n` +
      `${message.value.trim()}`
    );

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi…';
    window.location.href = `mailto:bonjour@quelto.fr?subject=${subject}&body=${body}`;

    setTimeout(() => {
      successBox.hidden = false;
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer →';
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
  });

  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => setInvalid(el, false));
  });
})();
