# Quelto

Sites web pour artisans, commerces et PME locales. Échange d'une demi-heure, livraison en 2 à 3 jours ouvrés, à partir de 500 €.

## Pages

- **`index.html`** — page d'accueil : pour qui, l'offre, déroulement, tarif, ce qu'on ne fait pas, qui je suis
- **`contact.html`** — formulaire de contact (validation client + fallback `mailto:`)

## Stack

HTML / CSS / JS statique pur. Zéro build, zéro dépendance backend, zéro framework.

- Typo : [Fraunces](https://fonts.google.com/specimen/Fraunces) (titres, serif variable) + [Inter](https://fonts.google.com/specimen/Inter) (corps)
- Couleurs : fond crème `#FAFAF7`, encre `#1A1A1A`, gris `#6B6963`
- Formulaire : validation native HTML5 + `mailto:` fallback (remplacer `contact.js` → `handleSubmit` pour brancher un service tiers type Formspree / Resend)

## Lancer en local

```bash
python3 -m http.server 8000
# ou
npx serve .
```

Puis ouvrir `http://localhost:8000`.

## Déployer

Site 100 % statique — compatible avec n'importe quel hébergeur :

- **Netlify** : drag & drop du dossier sur [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** : `vercel deploy` à la racine
- **GitHub Pages** : déjà activé sur la branche `main`, root `/`
- **Hostinger / OVH / tout mutualisé** : upload via FTP

## Notes éditoriales

- **Pas de faux témoignages / portfolio** : les sections "réalisations" et "avis clients" n'apparaissent pas tant qu'il n'y a rien de concret à montrer
- **Pas de promesses chiffrées** sur le retour sur investissement, le SEO, le nombre de clients gagnés. Un site rend visible, il ne transforme pas une activité à lui seul
- **Pas de formule "premium / standard / light"** : une seule offre, un seul tarif annoncé clairement après l'échange
- **Ton direct** : pas de bullshit marketing, pas de superlatifs, pas de "votre succès est notre priorité"
