# Système de Gestion de Tâches d'Équipe

> Application web développée avec Express.js, TypeScript, Prisma et EJS

## 📋 Description

Application web complète permettant de gérer des projets et des tâches en équipe. Le projet implémente une architecture
propre avec des design patterns modernes (Repository, Dependency Injection, Service Layer).

## ✨ Fonctionnalités

### API REST

- ✅ **CRUD complet pour les utilisateurs**
- ✅ **CRUD complet pour les projets** (avec association aux propriétaires)
- ✅ **CRUD complet pour les tâches** (avec statuts, priorités, assignation)
- ✅ **Validation des données** avec express-validator
- ✅ **Gestion robuste des erreurs**
- ✅ **Pagination et filtrage** des résultats

### Interface Utilisateur

- ✅ **Thème sombre** (Dark theme)
- ✅ **Switch Français/Anglais** (Internationalisation)
- ✅ **Vues EJS** pour le rendu côté serveur
- ✅ **Interface responsive** (Desktop + Mobile)
- ✅ **Filtrage avancé des tâches** (Recherche, Statut, Priorité, Assignataire)
- ✅ **Badge de filtre actif** avec suppression en un clic
- ✅ **Pagination intelligente** qui préserve les filtres

### Architecture & Qualité

- ✅ **Design Patterns** : Repository, Dependency Injection (tsyringe), Service Layer
- ✅ **TDD** : Tests unitaires et d'intégration avec Vitest
- ✅ **TypeScript strict** avec typage complet
- ✅ **Documentation** complète avec JSDoc
- ✅ **Docker** pour la conteneurisation

## 🚀 Technologies

- **Backend** : Express.js + TypeScript (Node 24.9)
- **Template Engine** : EJS
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Tests** : Vitest
- **DI** : tsyringe
- **Validation** : express-validator, zod
- **Logging** : winston
- **Conteneurisation** : Docker & Docker Compose

## 📦 Installation

### Prérequis

- Node.js >= 24.9.0
- Docker et Docker Compose
- npm >= 10.0.0

### Installation rapide

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd project

# 2. Installer les dépendances
npm install

# 3. Démarrer la base de données
docker-compose up -d

# 4. Générer le client Prisma et exécuter les migrations
npm run prisma:generate
npm run prisma:migrate

# 5. (Optionnel) Peupler la base de données
npm run prisma:seed

# 6. Démarrer le serveur en développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 🧪 Tests

### Tests Unitaires (Vitest)

```bash
# Exécuter tous les tests
npm test

# Mode interactif
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

### Tests E2E Navigateur (Playwright via Docker)

```bash
# Lancer la batterie E2E
npm run test:e2e:browser

# Nettoyer l’environnement E2E
npm run test:e2e:browser:down
```

#### Prérequis pour E2E

- Docker et Docker Compose installés
- Les tests E2E démarrent une base Postgres + l’application (image construite) puis exécutent Playwright dans un
  conteneur dédié.
- Les données de test (admin@example.com / admin123) sont seedées automatiquement.

## 📡 API REST

### Users

- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Projects

- `GET /api/projects` - Liste des projets
- `GET /api/projects/:id` - Détails d'un projet
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet
- `GET /api/projects/:id/statistics` - Statistiques du projet

### Tasks

- `GET /api/tasks` - Liste des tâches (avec filtres)
- `GET /api/tasks/:id` - Détails d'une tâche
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/:id` - Modifier une tâche
- `PATCH /api/tasks/:id/status` - Changer le statut
- `DELETE /api/tasks/:id` - Supprimer une tâche

**Filtres disponibles** : `?projectId=xxx&assigneeId=xxx&status=TODO&priority=HIGH&page=1&limit=10`

## 🏗️ Architecture

Le projet suit une architecture en couches (Layered Architecture) :

```
src/
├── controllers/     # Gestion des requêtes HTTP
├── services/        # Logique métier
├── repositories/    # Accès aux données
├── middleware/      # Middlewares Express
├── routes/          # Configuration des routes
├── config/          # Configuration de l'application
├── types/           # Définitions TypeScript
└── utils/           # Utilitaires
```

### Design Patterns utilisés

- **Repository Pattern** : Abstraction de l'accès aux données
- **Dependency Injection** : Gestion des dépendances avec tsyringe
- **Service Layer** : Séparation de la logique métier
- **Factory Pattern** : Création d'instances configurées

## 🎨 Fonctionnalités UI

### Thème Sombre

L'application dispose d'un thème sombre moderne et agréable pour les yeux.

### Internationalisation

Basculez facilement entre le français et l'anglais via un switch dans l'interface.

## 📚 Documentation Design System

Le projet dispose d'une documentation complète pour garantir la cohérence visuelle :

- **[DESIGN_SYSTEM_GUIDELINES.md](docs/DESIGN_SYSTEM_GUIDELINES.md)** : Référence complète du design system (couleurs, typographie, composants, responsive, dark mode)
- **[DESIGN_DECISION_TREE.md](docs/DESIGN_DECISION_TREE.md)** : Arbre de décision pour choisir les bons patterns (backgrounds, tailles de texte, couleurs sémantiques, composants)
- **[ANTI_PATTERNS.md](docs/ANTI_PATTERNS.md)** : Anti-patterns à éviter et corrections recommandées
- **[DARK_MODE_BEST_PRACTICES.md](docs/DARK_MODE_BEST_PRACTICES.md)** : Guide spécifique pour l'implémentation du dark mode
- **[RESPONSIVE_PATTERNS.md](docs/RESPONSIVE_PATTERNS.md)** : Patterns responsive et grids progressives

**Avant de créer une nouvelle page ou composant**, consultez ces documents pour garantir la cohérence du design.

## 📝 Licence

MIT

# TaskFlow

## Tests E2E (Playwright)

Des tests de bout-en-bout ont été ajoutés pour valider les parcours invités et authentifiés, le dashboard protégé, la
vue CRUD des tâches et le profil utilisateur.

Dossiers/fichiers clés:

- `tests/e2e/home.spec.ts`: smoke de la home invité
- `tests/e2e/health.spec.ts`: endpoint `/health`
- `tests/e2e/auth.spec.ts`: rendu login et scénario de connexion
- `tests/e2e/dashboard.spec.ts`: protection/affichage du dashboard
- `tests/e2e/tasks.spec.ts`: parcours CRUD minimal sur tâches (SSR)
- `tests/e2e/users.spec.ts`: accès `/users/me` (protégé) et présence du bouton Modifier
- `tests/e2e/utils/auth.ts`: helper de connexion Playwright

Prérequis: Docker installé (pour l’option Docker), ou Node 24+ et Playwright (pour l’option locale).

### Option A — via Docker (recommandé)

Cette option utilise `docker-compose.e2e.yml` (Postgres + app + runner Playwright). Aucune config locale supplémentaire
n’est requise.

```bash
# Depuis la racine du projet
docker compose -f docker-compose.e2e.yml up --build --abort-on-container-exit --exit-code-from e2e

# Nettoyage
docker compose -f docker-compose.e2e.yml down -v
```

Le service `app` expose un healthcheck et la base est automatiquement semée (seed). Le service `e2e` lance ensuite
Playwright avec `BASE_URL=http://app:3000`.

### Option B — en local

1. Installer les dépendances et Playwright

```bash
npm ci
npx playwright install --with-deps
```

2. Lancer une base Postgres locale (ou exporter `DATABASE_URL` vers une instance existante) puis migrer/seed:

```bash
# Exemple si vous avez Postgres localement configuré via .env
npm run prisma:migrate:deploy || npm run prisma:migrate
npm run prisma:seed
```

3. Démarrer l’app en local (assurez-vous que `PORT` est 3000, par défaut)

```bash
npm run dev
```

4. Dans un second terminal, exécuter Playwright en pointant vers l’app:

```bash
BASE_URL=http://localhost:3000 npx playwright test --reporter=list
```

Vous pouvez cibler un seul fichier:

```bash
BASE_URL=http://localhost:3000 npx playwright test tests/e2e/tasks.spec.ts
```

### Comptes de test (seed)

Le seed Prisma crée notamment:

- `admin@example.com` / `admin123`
- `john@example.com` / `password123`
- `jane@example.com` / `password123`

### Dépannage rapide

- Assurez-vous que l’app est accessible sur `BASE_URL` (par exemple `http://localhost:3000`) avant de lancer Playwright.
- Si le formulaire de connexion change (labels, texte des boutons), mettez à jour `tests/e2e/utils/auth.ts` pour aligner
  les sélecteurs.
- En cas d’échec sur le CRUD de tâches, vérifiez que la base contient des utilisateurs (via le seed) pour l’assignation.
