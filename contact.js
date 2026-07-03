/* Quelto — contact form
   No backend. We compose a mailto: link with all fields.
   To swap to a real backend later (Formspree, Resend, etc.),
   replace the body of `submit` handler — keep the same field names. */

(() => {
  'use strict';
  const form = document.getElementById('contactForm');
  if (!form) return;

  const RECIPIENT = 'remi@quelto.fr';
  const SUBJECT_PREFIX = '[Quelto] Nouveau projet';

  const showNote = (msg, ok = true) => {
    let n = form.querySelector('.form-status');
    if (!n) {
      n = document.createElement('p');
      n.className = 'form-status';
      n.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;';
      form.appendChild(n);
    }
    n.textContent = msg;
    n.style.color = ok ? 'var(--orange)' : '#F87171';
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = new FormData(form);
    const name    = (data.get('name')    || '').toString().trim();
    const company = (data.get('company') || '').toString().trim();
    const email   = (data.get('email')   || '').toString().trim();
    const phone   = (data.get('phone')   || '').toString().trim();
    const project = (data.get('project') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    // Basic validation
    if (!name || !email || !project || !message) {
      showNote('Champs requis manquants.', false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showNote('Adresse mail invalide.', false);
      return;
    }

    const projectLabels = {
      onepage: 'One-page (à partir de 500 €)',
      vitrine: 'Vitrine 5 pages (à partir de 900 €)',
      surmesure: 'Sur-mesure (devis)',
      maintenance: 'Maintenance / site existant',
      autre: 'Autre chose'
    };

    const body =
`Nom : ${name}
${company ? 'Commerce/Entreprise : ' + company + '\n' : ''}Email : ${email}
${phone ? 'Téléphone : ' + phone + '\n' : ''}Projet : ${projectLabels[project] || project}

Message :
${message}

---
Envoyé depuis le formulaire quelto.fr (pas de données stockées).`;

    const subject = `${SUBJECT_PREFIX} — ${projectLabels[project] || '?'} — ${name}`;
    const mailto = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showNote('Ouverture de votre client mail…', true);
    window.location.href = mailto;
  });
})();
