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

### 3. Déploiement permanent (accès de partout, même en 4G)

Le code source est sur GitHub : https://github.com/ferreiraflorian303-commits/nutriscan

Trois services gratuits sont nécessaires : une base de données Postgres (Neon), un hébergement pour le serveur (Render), un hébergement pour l'app (Vercel).

**a) Base de données — Neon**
1. Va sur https://neon.tech, crée un compte gratuit
2. Crée un nouveau projet (nom libre, ex. "nutriscan")
3. Copie la "Connection string" (commence par `postgresql://...`)

**b) Serveur — Render**
1. Va sur https://render.com, crée un compte gratuit (tu peux te connecter avec GitHub directement)
2. Clique "New +" → "Blueprint", connecte le dépôt `nutriscan` — Render détecte automatiquement `render.yaml`
3. Il te demandera de remplir les variables d'environnement suivantes :
   - `DATABASE_URL` : la connection string Neon copiée à l'étape a
   - `APP_PIN` : ton code d'accès
   - `ANTHROPIC_API_KEY` : ta clé Anthropic
   - `CLIENT_ORIGIN` : laisse vide pour l'instant, tu la complèteras après l'étape c avec l'URL Vercel
4. Déploie. Une fois terminé, note l'URL du serveur (ex. `https://nutriscan-server.onrender.com`)

**c) App — Vercel**
1. Va sur https://vercel.com, crée un compte gratuit (connexion GitHub recommandée)
2. "Add New" → "Project", importe le dépôt `nutriscan`
3. Dans "Root Directory", sélectionne `client`
4. Ajoute la variable d'environnement `VITE_API_URL` = `https://nutriscan-server.onrender.com/api` (l'URL Render de l'étape b, suivie de `/api`)
5. Déploie. Vercel te donne une URL du type `https://nutriscan-xxxx.vercel.app`

**d) Finaliser**
1. Retourne sur Render, dans les paramètres d'environnement du service, mets `CLIENT_ORIGIN` = l'URL Vercel obtenue à l'étape c (sans `/` à la fin), puis redéploie
2. Sur le téléphone de ta copine (en 4G ou n'importe quel réseau), ouvre l'URL Vercel, connecte-toi avec le PIN, puis "Ajouter à l'écran d'accueil"

Note : le serveur Render gratuit se met en veille après 15 min d'inactivité — le premier chargement après une pause peut prendre ~30 secondes le temps qu'il redémarre.

### 4. Accès local sur le même Wi-Fi (alternative sans déploiement)

1. Trouve l'IP locale de ton PC (`ipconfig` → IPv4, ex. `192.168.1.42`)
2. Lance `npx vite --host` dans `client/` pour exposer sur toutes les interfaces
3. Dans `server/.env`, mets `CLIENT_ORIGIN="http://192.168.1.42:5180"`
4. Sur le téléphone (même Wi-Fi), ouvre `http://192.168.1.42:5180`

## Fonctionnalités

- Connexion par code PIN privé (accès réservé)
- Onboarding : calcul des besoins caloriques (formule Mifflin-St Jeor) et objectifs macros selon profil, objectif de poids et rythme souhaité
- Scan de plat par photo → analyse IA (identification des aliments, quantités, calories, protéines/glucides/lipides) avec possibilité de corriger les valeurs avant d'enregistrer
- Dashboard quotidien : calories restantes, barres de macros, liste des repas du jour
- Journal : historique par jour avec navigation
- Suivi de poids : saisie + graphique de progression vers l'objectif
- PWA installable sur l'écran d'accueil du téléphone
