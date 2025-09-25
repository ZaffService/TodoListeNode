
Bonjour!  

Bienvenue dans **Todo Zafe**, une application full-stack moderne et collaborative pour la gestion de tâches. Développée avec passion par **Moustapha Seck**, ce projet intègre un backend robuste et un frontend intuitif pour une expérience utilisateur fluide.  

Cette app permet aux utilisateurs de créer, modifier, assigner et suivre des tâches en équipe, avec des fonctionnalités avancées comme les permissions, l'historique des modifications, les pièces jointes (images) et même les messages vocaux !  

C'est parfait pour tester en classe ou en projet personnel. Suivez les instructions ci-dessous pour l'installer et l'utiliser facilement. Si vous avez des questions, n'hésitez pas !  

## ✨ Fonctionnalités Principales

- **Authentification Sécurisée** : Inscription, connexion et gestion des sessions avec JWT.
- **Gestion de Tâches** : Créer, éditer, supprimer, rechercher, filtrer et paginer les tâches.
- **Permissions Collaboratives** : Assigner des rôles (propriétaire, éditeur, lecteur) aux utilisateurs pour les tâches.
- **Historique des Modifications** : Suivi automatique des changements sur les tâches (qui a fait quoi, quand).
- **Téléchargements de Fichiers** : Upload d'images (stockées sur Cloudinary) associées aux tâches.
- **Messages Vocaux** : Enregistrement et lecture de notes audio pour les tâches (format WebM).
- **Interface Intuitive** : Design responsive avec modales, recherche en temps réel et navigation fluide.
- **Planification** : Support pour les dates d'échéance et statuts (en cours, terminée, etc.).

L'app est conçue pour être scalable et sécurisée, avec une base de données relationnelle pour les relations complexes (utilisateurs-tâches-permissions).

## 🛠️ Stack Technique

### Backend
- **Langage** : TypeScript (avec Node.js)
- **Framework** : Express.js pour les routes et middleware
- **Base de Données** : Prisma ORM avec PostgreSQL (schéma inclus)
- **Authentification** : JWT pour les tokens sécurisés
- **Stockage Fichiers** : Cloudinary pour les images
- **Autres** : Multer pour uploads, Nodemailer (optionnel), Seeders pour données de test

### Frontend
- **Framework** : React.js avec Vite pour le build rapide
- **Styling** : Tailwind CSS pour un design moderne et responsive
- **Gestion d'État** : React Context API (AuthContext et TodoContext)
- **Routage** : React Router (protégé pour les routes authentifiées)
- **Validation** : Formulaires avec validation personnalisée
- **Autres** : Axios pour les API calls, Web Audio API pour les voix

Le projet est divisé en deux dossiers : `BACKEND/` et `FRONTEND/`.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** : Version 18+ (téléchargez depuis [nodejs.org](https://nodejs.org))
- **npm** ou **yarn** : Pour gérer les dépendances
- **PostgreSQL** : Version 14+ (installez via [postgresql.org](https://www.postgresql.org) ou utilisez Docker)
- **Compte Cloudinary** : Gratuit pour les uploads (créez un compte sur [cloudinary.com](https://cloudinary.com) et obtenez vos clés API)
- **Git** : Pour cloner le repo (optionnel si vous avez déjà les fichiers)

Outils optionnels :
- VS Code pour l'édition
- Postman ou Insomnia pour tester les API

## 🚀 Installation et Configuration

### 1. Clonage et Structure
Si vous clonez depuis un repo Git :
```
git clone <votre-repo-url>
cd PROJET_TODOLIST
```

La structure est :
- `BACKEND/` : Serveur API
- `FRONTEND/` : Interface utilisateur

### 2. Configuration Backend

#### a. Installation des Dépendances
Naviguez dans le dossier backend :
```
cd BACKEND
npm install
```

#### b. Configuration Environnement
Créez un fichier `.env` dans `BACKEND/` avec le contenu suivant (adaptez les valeurs) :
```
# Base de Données
DATABASE_URL="postgresql://username:password@localhost:5432/todolist?schema=public"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise-ici"  # Changez ceci !
JWT_EXPIRES_IN="24h"

# Cloudinary (obtenez de votre dashboard)
CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"

# Port Serveur
PORT=5000

# Autres (optionnel)
NODE_ENV="development"
```

#### c. Configuration Base de Données
- Créez une base de données mysql nommée `todolist`.
- Générez le client Prisma :
  ```
  npx prisma generate
  ```
- Appliquez les migrations (inclut le schéma avec modèles User, Task, Permission, Historique) :
  ```
  npx prisma migrate dev --name init
  ```
- Pour des données de test (seeders) :
  ```
  npx prisma db seed
  ```
  (Exécutez `npm run seed` si configuré dans package.json)

Le schéma Prisma (`BACKEND/prisma/schema.prisma`) définit :
- **User** : id, email, password (hashé), nom, etc.
- **Task** : id, titre, description, statut, dateEcheance, voiceMessage, imageUrl, ownerId.
- **Permission** : userId, taskId, role (OWNER, EDITOR, VIEWER).
- **HistoriqueModifTache** : taskId, userId, action, ancienValeur, nouvelleValeur, date.

#### d. Lancement Backend
```
npm run dev  # Mode développement avec nodemon
# ou
npm start    # Mode production
```

Le serveur tournera sur `http://localhost:5000`. Vérifiez avec `/api/health` (si implémenté).

### 3. Configuration Frontend

#### a. Installation des Dépendances
Naviguez dans le dossier frontend :
```
cd ../FRONTEND
npm install
```

#### b. Configuration API
Dans `FRONTEND/src/config/api.js`, mettez à jour l'URL de base :
```js
const API_BASE_URL = 'http://localhost:5000/api';  
```

#### c. Lancement Frontend
```
npm run dev  # Lance Vite sur http://localhost:5173
```

Ouvrez `http://localhost:5173` dans votre navigateur.

## 🔄 Utilisation

### Flux Utilisateur
1. **Inscription/Connexion** : Allez sur la page d'accueil, inscrivez-vous ou connectez-vous.
2. **Dashboard Tâches** : Une fois connecté, accédez à la liste des tâches (vos tâches et partagées).
3. **Ajouter une Tâche** : Utilisez le formulaire pour créer une tâche, ajoutez description, date, image ou message vocal.
4. **Gérer Permissions** : Dans la modale permissions, invitez des utilisateurs par email et assignez des rôles.
5. **Historique** : Cliquez sur une tâche pour voir l'historique des modifications.
6. **Recherche/Filtre** : Utilisez la barre de recherche ou les filtres (statut, date).
7. **Édition/Suppression** : Modifiez ou supprimez (seuls les propriétaires ou éditeurs peuvent).

### Messages Vocaux
- Cliquez sur l'icône micro pour enregistrer (utilise Web Audio API).
- Les fichiers sont uploadés et associés à la tâche.

### Test en Équipe
- Créez plusieurs comptes pour tester les permissions.
- Partagez des tâches et vérifiez l'historique.

## 📡 Aperçu des API (Backend)

Utilisez Postman pour tester. Toutes les routes nécessitent un token JWT (envoyé dans `Authorization: Bearer <token>` après login).

- **Auth** :
  - `POST /api/auth/register` : {email, password, nom} → Créer utilisateur
  - `POST /api/auth/login` : {email, password} → {token, user}

- **Tâches** :
  - `GET /api/tasks` : Lister tâches (avec pagination ?page=1&limit=10)
  - `POST /api/tasks` : Créer tâche {titre, description, dateEcheance, ...}
  - `GET /api/tasks/:id` : Détails tâche (inclut historique, permissions)
  - `PUT /api/tasks/:id` : Mettre à jour
  - `DELETE /api/tasks/:id` : Supprimer
  - `POST /api/tasks/:id/upload-image` : Upload image (multipart/form-data)
  - `POST /api/tasks/:id/voice-message` : Upload voix

- **Permissions** :
  - `POST /api/permissions` : Assigner {taskId, userEmail, role}
  - `GET /api/permissions/task/:taskId` : Lister permissions

- **Historique** :
  - `GET /api/historique/task/:taskId` : Lister modifications

Réponses formatées avec middleware (succès/erreurs en français).

## 🐛 Dépannage

- **Erreur DB** : Vérifiez `DATABASE_URL` et que mysql tourne. Relancez `prisma migrate`.
- **Uploads Cloudinary** : Assurez-vous que les vars env sont correctes ; testez avec un upload simple.
- **CORS** : Le backend est configuré pour `http://localhost:5173`.
- **JWT Invalide** : Régénérez le token après expiration.
- **Voice Messages** : Autorisez le micro dans le navigateur (HTTPS en prod).
- **Migrations Manquantes** : Exécutez `npx prisma migrate reset` pour reset DB (attention : efface données !).
- **Logs** : Vérifiez console backend pour erreurs.

Si des problèmes persistent, vérifiez les fichiers `package.json` pour scripts et dépendances.

## 📁 Structure du Projet

- **BACKEND/** :
  - `src/controllers/` : Logique business (Auth, Task, etc.)
  - `src/routes/` : Définition des endpoints
  - `src/services/` : Services (Prisma queries, Cloudinary, JWT)
  - `src/models/` : Modèles Prisma
  - `prisma/schema.prisma` : Schéma DB
  - `uploads/` : Fichiers temporaires (images/voix)

- **FRONTEND/** :
  - `src/components/TodoComponents/` : UI pour tâches (modales, liste, etc.)
  - `src/contexte/` : Contextes pour état global
  - `src/services/api.service.js` : Appels API
  - `src/utils/audioUtils.js` : Gestion audio

## 🤝 Contribution & Crédits

Ce projet est open-source friendly ! Si vous voulez contribuer :
1. Fork le repo
2. Créez une branch `feature/nouvelle-fonc`
3. Commit et push
4. Pull Request

Développé par **Moustapha Seck** pour le cours. Merci à notre coach Aly pour l'opportunité !  


**Version** : 1.0  
**Date** : le 25 Septembre 2025  
**Contact** : seckmoustapha238@gmail.om

---
*Licence : MIT (utilisez librement pour éducation)*
