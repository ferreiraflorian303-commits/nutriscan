# NutriScan

App privée (PWA) pour scanner ses plats en photo, avoir les valeurs nutritionnelles calculées par IA, et suivre un objectif de perte de poids (calories, macros, poids).

## Structure

- `server/` — API Express + TypeScript + Prisma (SQLite), analyse des photos via l'API Claude (vision)
- `client/` — App React + TypeScript + Tailwind, PWA installable sur téléphone

## Mise en route

### 1. Configurer le serveur

Dans `server/.env` :
- `APP_PIN` : le code à 4 chiffres pour se connecter (change `1234` par un code perso)
- `ANTHROPIC_API_KEY` : **obligatoire** pour l'analyse photo. Récupère une clé sur https://console.anthropic.com/ et remplace `your-anthropic-api-key-here`
- `SESSION_SECRET` : remplace par une chaîne aléatoire

### 2. Lancer en local

```
cd server && npm run dev     # API sur http://localhost:4100
cd client && npm run dev     # App sur http://localhost:5180
```

Ou via les configs `.claude/launch.json` du dossier BATILIB (`nutriscan-server`, `nutriscan-client`).

### 3. Utiliser depuis le téléphone de ta copine (même Wi-Fi)

Par défaut le serveur front est lié à `127.0.0.1` (local uniquement). Pour un accès depuis un téléphone sur le même réseau :

1. Trouve l'IP locale de ton PC (`ipconfig` → IPv4, ex. `192.168.1.42`)
2. Dans `client/vite.config.ts`, ou en lançant `npx vite --host` dans `client/`, expose sur toutes les interfaces
3. Dans `server/.env`, mets `CLIENT_ORIGIN="http://192.168.1.42:5180"`
4. Sur le téléphone, ouvre `http://192.168.1.42:5180` dans le navigateur, connecte-toi avec le PIN, puis "Ajouter à l'écran d'accueil" pour l'installer comme une app.

### 4. Déploiement permanent (optionnel)

Pour un accès de partout (pas seulement à la maison), il faudra héberger `server/` (ex. Railway, Render) et `client/` (ex. Vercel, Netlify), avec une vraie base de données persistante et HTTPS.

## Fonctionnalités

- Connexion par code PIN privé (accès réservé)
- Onboarding : calcul des besoins caloriques (formule Mifflin-St Jeor) et objectifs macros selon profil, objectif de poids et rythme souhaité
- Scan de plat par photo → analyse IA (identification des aliments, quantités, calories, protéines/glucides/lipides) avec possibilité de corriger les valeurs avant d'enregistrer
- Dashboard quotidien : calories restantes, barres de macros, liste des repas du jour
- Journal : historique par jour avec navigation
- Suivi de poids : saisie + graphique de progression vers l'objectif
- PWA installable sur l'écran d'accueil du téléphone
