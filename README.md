# Quelto

Site vitrine pour Quelto — sites web pour artisans, commerçants et PME locales.
Développé par Rémi Chevassut, auto-entrepreneur, Grenoble.

## Stack

- HTML / CSS / JavaScript statique
- Aucune dépendance npm, aucun build
- Hébergé sur GitHub Pages

## Structure

- `index.html` — page principale
- `contact.html` — page de contact
- `style.css` — styles globaux
- `contact.css` — styles spécifiques au formulaire
- `script.js` — interactions (cursor, parallax, reveal, count-up, magnetic, menu)
- `contact.js` — formulaire (mailto fallback)
- `assets/` — favicon

## Développement local

Le site est statique. Pour le tester :

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Déploiement

Push sur la branche `main` → GitHub Pages redéploie automatiquement.

```bash
git add .
git commit -m "..."
git push
```
