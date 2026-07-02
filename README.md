# Quelto

Sites web pour artisans, commerces et PME locales — livré en 2-3 jours, à partir de 500€.

## Pages

- **`index.html`** — page d'accueil (one-pager : hero, problème, offre, process, CTA)
- **`contact.html`** — formulaire de contact (validation client + fallback `mailto:`)
- **`realisations.html`** — état vide honnête tant qu'il n'y a pas de premières livraisons

## Stack

HTML / CSS / JS statique pur. Zéro build, zéro dépendance backend.

- Typo : [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [DM Serif Display](https://fonts.google.com/specimen/DM+Serif+Display)
- Couleurs : bleu profond `#1E40AF` (accents), crème `#FBFAF7` (fond chaud)
- Formulaire : validation native HTML5 + `mailto:` fallback (remplacer `contact.js` → `handleSubmit` pour brancher un service tiers type Formspree / Resend)

## Lancer en local

```bash
python3 -m http.server 8000
# ou
npx serve .
```

Puis ouvrir `http://localhost:8000`.

## Déployer

Site 100% statique — compatible avec n'importe quel hébergeur :

- **Netlify** : drag & drop du dossier sur [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** : `vercel deploy` à la racine
- **GitHub Pages** : activer Pages dans Settings → branch `main` → root
- **Hostinger / OVH / tout mutualisé** : upload via FTP

## Notes de contenu

- Pas de faux témoignages / portfolio : les sections s'activent uniquement quand on a de vrais retours
- L'offre "Prospection & automatisation IA" est volontairement discrète (pill "Bientôt disponible") tant que l'offre 1 n'a pas de traction
- Charte tonale : premium mais accessible, jamais intimidant pour un patron de PME
