.PHONY: help install dev build start stop restart logs clean test lint docker-up docker-down docker-logs prisma-migrate prisma-seed


# Colors

BLUE := \033[0;34mGuide complet pour développer et déployer TaskFlow avec Docker et Tailwind CSS v4.# Variables

GREEN := \033[0;32m

YELLOW := \033[1;33mNODE := node

NC := \033[0m

---NPM := npm

.DEFAULT_GOAL := help

PRISMA := npx prisma

help: ## Show this help message

	@echo "$(BLUE)TaskFlow - Available Commands:$(NC)"## 🚀 Démarrage RapideVITEST := npx vitest

	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

ESLINT := npx eslint

install: ## Install dependencies

	@echo "$(YELLOW)Installing dependencies...$(NC)"### Mode Développement (Recommandé)

	@npm install

	@npx prisma generate# Couleurs pour l'output

	@echo "$(GREEN)✓ Dependencies installed$(NC)"

```bashBLUE := \033[0;34m

dev: ## Start development server with hot reload

	@echo "$(YELLOW)Starting development server...$(NC)"# Démarrer les containers dev avec hot reloadGREEN := \033[0;32m

	@npm run dev

make docker-dev-upYELLOW := \033[1;33m

build: ## Build for production

	@echo "$(YELLOW)Building application...$(NC)"NC := \033[0m # No Color

	@npm run build

	@echo "$(GREEN)✓ Build complete$(NC)"# Voir les logs



start: ## Start production servermake docker-dev-logshelp: ## Affiche cette aide

	@echo "$(YELLOW)Starting production server...$(NC)"

	@npm start	@echo "$(BLUE)Commandes disponibles:$(NC)"



test: ## Run tests# Arrêter	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

	@echo "$(YELLOW)Running tests...$(NC)"

	@npm testmake docker-dev-down



test-watch: ## Run tests in watch mode```install: ## Installe les dépendances

	@npm run test:watch

	@echo "$(YELLOW)Installation des dépendances...$(NC)"

test-e2e: ## Run E2E tests

	@echo "$(YELLOW)Running E2E tests...$(NC)"**URL** : http://localhost:3000	$(NPM) install

	@npm run test:e2e:browser



test-coverage: ## Run tests with coverage

	@echo "$(YELLOW)Running tests with coverage...$(NC)"**Features** :dev: ## Lance le serveur en mode développement avec Node.js natif

	@npm run test:coverage

- ✅ Hot reload code TypeScript (tsx watch)	@echo "$(YELLOW)Démarrage du serveur en mode développement...$(NC)"

lint: ## Lint code

	@echo "$(YELLOW)Linting code...$(NC)"- ✅ Hot reload CSS Tailwind v4 (watch mode)	$(NODE) --env-file=.env --experimental-strip-types --watch --no-warnings=ExperimentalWarning --import ./loader.mjs src/server.ts

	@npm run lint

- ✅ Hot reload templates EJS

lint-fix: ## Fix linting issues

	@echo "$(YELLOW)Fixing linting issues...$(NC)"- ✅ Source code monté en volume (pas de rebuild)build: ## Compile le projet TypeScript

	@npm run lint:fix

- ✅ PostgreSQL sur port 5433	@echo "$(YELLOW)Compilation du projet...$(NC)"

format: ## Format code

	@echo "$(YELLOW)Formatting code...$(NC)"	npx tsc

	@npm run format

### Mode Production	@echo "$(YELLOW)Résolution des alias de chemins...$(NC)"

clean: ## Clean generated files

	@echo "$(YELLOW)Cleaning generated files...$(NC)"	npx tsc-alias

	@rm -rf dist coverage test-results node_modules/.cache

	@echo "$(GREEN)✓ Clean complete$(NC)"```bash	@echo "$(YELLOW)Ajout des extensions .js...$(NC)"



# Docker commands# Build et démarrer	$(NODE) scripts/add-js-extensions.mjs

docker-up: ## Start Docker containers (production)

	@echo "$(YELLOW)Starting Docker containers...$(NC)"make docker-up	@echo "$(GREEN)✓ Build terminé$(NC)"

	@docker compose up -d

	@echo "$(GREEN)✓ Containers started - http://localhost:3000$(NC)"



docker-down: ## Stop Docker containers# Voir les logsstart: ## Lance le serveur en production

	@echo "$(YELLOW)Stopping Docker containers...$(NC)"

	@docker compose downmake docker-logs	@echo "$(YELLOW)Démarrage du serveur en production...$(NC)"

	@echo "$(GREEN)✓ Containers stopped$(NC)"

	$(NODE) dist/server.js

docker-logs: ## Show Docker logs

	@docker compose logs -f# Arrêter



docker-restart: ## Restart Docker containersmake docker-downtest: ## Lance tous les tests

	@echo "$(YELLOW)Restarting Docker containers...$(NC)"

	@docker compose restart```	@echo "$(YELLOW)Exécution des tests...$(NC)"

	@echo "$(GREEN)✓ Containers restarted$(NC)"

	$(VITEST) run

docker-dev: ## Start Docker containers (development with hot reload)

	@echo "$(YELLOW)Starting Docker development environment...$(NC)"---

	@docker compose -f docker-compose.dev.yml up -d

	@echo "$(GREEN)✓ Development containers started - http://localhost:3000$(NC)"test-watch: ## Lance les tests en mode watch



docker-dev-down: ## Stop development Docker containers## 📁 Structure Docker	$(VITEST)

	@echo "$(YELLOW)Stopping development containers...$(NC)"

	@docker compose -f docker-compose.dev.yml down

	@echo "$(GREEN)✓ Development containers stopped$(NC)"

```test-ui: ## Lance les tests avec l'interface UI

docker-build: ## Build Docker images

	@echo "$(YELLOW)Building Docker images...$(NC)".	$(VITEST) --ui

	@docker compose build

	@echo "$(GREEN)✓ Build complete$(NC)"├── docker-compose.yml        # Production



docker-rebuild: ## Rebuild Docker images (no cache)├── docker-compose.dev.yml    # Développement (hot reload)test-coverage: ## Lance les tests avec couverture

	@echo "$(YELLOW)Rebuilding Docker images...$(NC)"

	@docker compose build --no-cache├── Dockerfile                # Image production (multi-stage)	@echo "$(YELLOW)Exécution des tests avec couverture...$(NC)"

	@echo "$(GREEN)✓ Rebuild complete$(NC)"

├── Dockerfile.dev            # Image développement	$(VITEST) run --coverage

docker-clean: ## Clean Docker resources

	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"├── docker-entrypoint.sh      # Entrypoint (migrations, seed)

	@docker compose down -v --remove-orphans

	@docker system prune -f└── .dockerignore             # Fichiers exclustest-e2e: ## Lance les tests E2E

	@echo "$(GREEN)✓ Docker clean complete$(NC)"

```	@echo "$(YELLOW)Exécution des tests E2E...$(NC)"

# Prisma commands

prisma-generate: ## Generate Prisma client	$(VITEST) run --config vitest.config.ts src/test/e2e.test.ts

	@echo "$(YELLOW)Generating Prisma client...$(NC)"

	@npx prisma generate---

	@echo "$(GREEN)✓ Prisma client generated$(NC)"

lint: ## Vérifie le code avec ESLint

prisma-migrate: ## Create and apply database migration

	@echo "$(YELLOW)Creating and applying migration...$(NC)"## 🔧 Configuration Détaillée	@echo "$(YELLOW)Vérification du code...$(NC)"

	@npx prisma migrate dev

	@echo "$(GREEN)✓ Migration complete$(NC)"	$(ESLINT) . --ext .ts



prisma-migrate-deploy: ## Apply migrations (production)### docker-compose.dev.yml (Développement)

	@echo "$(YELLOW)Applying migrations...$(NC)"

	@npx prisma migrate deploylint-fix: ## Corrige automatiquement les erreurs ESLint

	@echo "$(GREEN)✓ Migrations applied$(NC)"

**Services** :	@echo "$(YELLOW)Correction automatique du code...$(NC)"

prisma-seed: ## Seed database

	@echo "$(YELLOW)Seeding database...$(NC)"- `db` : PostgreSQL 18 (port 5433)	$(ESLINT) . --ext .ts --fix

	@npm run prisma:seed

	@echo "$(GREEN)✓ Database seeded$(NC)"- `app` : Node.js 24 avec hot reload



prisma-studio: ## Open Prisma Studioformat: ## Formate le code avec Prettier

	@echo "$(YELLOW)Opening Prisma Studio...$(NC)"

	@npx prisma studio**Volumes montés** :	@echo "$(YELLOW)Formatage du code...$(NC)"



# Combined shortcuts```yaml	npx prettier --write "src/**/*.ts"

setup: install prisma-migrate prisma-seed ## Full setup (install + migrate + seed)

	@echo "$(GREEN)✓ Setup complete!$(NC)"volumes:



dev-docker: docker-dev docker-logs ## Start dev containers and show logs  - ./src:/app/src:ro                    # Code TypeScript (lecture seule)css-build: ## Compile le CSS avec Tailwind v4



reset-db: ## Reset database (WARNING: deletes all data)  - ./views:/app/views:ro                # Templates EJS	@echo "$(YELLOW)Compilation du CSS avec Tailwind v4...$(NC)"

	@echo "$(YELLOW)Resetting database...$(NC)"

	@docker compose exec db psql -U taskflow -d taskflow_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"  - ./public/css:/app/public/css         # CSS Tailwind v4 (lecture/écriture)	$(NPM) run css:build

	@make prisma-migrate

	@make prisma-seed  - ./public/js:/app/public/js:ro        # JS client	@echo "$(GREEN)✓ CSS compilé$(NC)"

	@echo "$(GREEN)✓ Database reset complete$(NC)"

  - ./prisma:/app/prisma:ro              # Schema Prisma

  - /app/node_modules                    # Node modules du containercss-watch: ## Compile le CSS en mode watch avec Tailwind v4

```	@echo "$(YELLOW)Watch mode CSS activé (Tailwind v4)...$(NC)"

	$(NPM) run css:watch

**Avantages** :

- Changements code → Hot reload automatique (tsx watch)prisma-generate: ## Génère le client Prisma

- Changements CSS → Recompilation automatique (Tailwind v4 watch)	@echo "$(YELLOW)Génération du client Prisma...$(NC)"

- Changements EJS → Refresh navigateur suffit	$(PRISMA) generate

- Pas de rebuild container nécessaire

prisma-migrate: ## Crée et applique une migration Prisma

### docker-compose.yml (Production)	@echo "$(YELLOW)Création et application d'une migration...$(NC)"

	$(PRISMA) migrate dev

**Build multi-stage** :

1. **Stage base** : Install deps, build CSS Tailwind v4, compile TypeScriptprisma-migrate-create: ## Crée une nouvelle migration Prisma avec Docker

2. **Stage production** : Copy artifacts, production deps only	@echo "$(YELLOW)Génération d'une nouvelle migration Prisma...$(NC)"

	@echo "Démarrage des conteneurs..."

**Optimisations** :	@docker compose up -d

- CSS pré-compilé avec Tailwind v4	@echo "Attente de PostgreSQL (15 secondes)..."

- TypeScript compilé en JavaScript	@sleep 15

- Prisma client généré	@echo "Génération de la migration..."

- Image finale : ~200 MB (Alpine)	@docker compose exec app npx prisma migrate dev --name init --skip-seed

	@echo "Copie des migrations vers l'hôte..."

---	@docker compose cp app:/app/prisma/migrations ./prisma/ 2>/dev/null || true

	@echo "$(GREEN)✓ Migration générée$(NC)"

## 🎨 Tailwind v4 dans Docker	@ls -la ./prisma/migrations/ 2>/dev/null || echo "Vérifiez dans le conteneur"



### Build CSSprisma-migrate-deploy: ## Applique les migrations en production

	@echo "$(YELLOW)Application des migrations...$(NC)"

**Développement** (automatique) :	$(PRISMA) migrate deploy

```bash

# Dans le container, npm run dev lance :prisma-migrate-docker: ## Applique les migrations dans le conteneur Docker

# - tsx watch (hot reload code)	@echo "$(YELLOW)Application des migrations dans Docker...$(NC)"

# - css:watch (Tailwind v4 watch mode)	./prisma-migrate-docker.sh

```

prisma-migrate-status-docker: ## Vérifie l'état des migrations dans Docker

**Production** :	@echo "$(YELLOW)Vérification de l'état des migrations...$(NC)"

```dockerfile	docker compose exec app npx prisma migrate status

# Dans Dockerfile

RUN npm run css:build  # Compile CSS avant build TSprisma-seed: ## Remplissage de la base de données avec des données de test

RUN npm run build      # Compile TypeScript	@echo "$(YELLOW)Remplissage de la base de données...$(NC)"

```	$(NODE) --env-file=.env --experimental-strip-types --import ./loader.mjs prisma/seed.ts



### Fichiers CSSprisma-seed-docker: ## Remplissage de la base de données dans Docker

	@echo "$(YELLOW)Remplissage de la base de données dans Docker...$(NC)"

```	docker compose exec app node --env-file=.env --experimental-strip-types --import ./loader.mjs prisma/seed.ts

public/css/

├── tailwind.css     # Source (avec @import "tailwindcss")prisma-studio: ## Ouvre Prisma Studio

├── theme.css        # Config Tailwind v4 (@theme {})	@echo "$(YELLOW)Ouverture de Prisma Studio...$(NC)"

└── output.css       # Généré (78 KB en v4)	$(PRISMA) studio

```

docker-dev-up: ## Lance les conteneurs Docker en mode développement avec hot reload

**Watch mode** : Détecte changements dans :	@echo "$(YELLOW)Démarrage en mode DÉVELOPPEMENT (hot reload activé)...$(NC)"

- `views/**/*.ejs`	docker compose -f docker-compose.dev.yml up -d

- `src/**/*.{ts,js}`	@echo "$(GREEN)✓ Conteneurs dev démarrés - http://localhost:3000$(NC)"

- `public/css/*.css`	@echo "$(BLUE)💡 CSS watch mode automatique, changez les fichiers .ejs ou .css pour voir les modifications$(NC)"



### Différences v3 → v4docker-dev-down: ## Arrête les conteneurs Docker dev

	@echo "$(YELLOW)Arrêt des conteneurs dev...$(NC)"

| Aspect | v3 | v4 |	docker compose -f docker-compose.dev.yml down

|--------|-----|-----|	@echo "$(GREEN)✓ Conteneurs dev arrêtés$(NC)"

| Config | `tailwind.config.js` | `theme.css` (@theme) |

| Import | `@tailwind base/components/utilities` | `@import "tailwindcss"` |docker-dev-logs: ## Affiche les logs Docker dev

| Plugin Container | Requis | ✅ Natif |	docker compose -f docker-compose.dev.yml logs -f

| Build Speed | 378ms | 100ms (3.78x plus rapide) |

docker-dev-rebuild: ## Rebuild complet dev (sans cache)

---	@echo "$(YELLOW)Rebuild complet dev (Tailwind v4)...$(NC)"

	docker compose -f docker-compose.dev.yml build --no-cache

## 🛠️ Commandes Make	docker compose -f docker-compose.dev.yml up -d

	@echo "$(GREEN)✓ Rebuild dev terminé$(NC)"

### Développement

docker-up: ## Lance les conteneurs Docker (production)

```bash	@echo "$(YELLOW)Démarrage des conteneurs Docker...$(NC)"

make docker-dev-up        # Start dev containers	docker-compose up -d

make docker-dev-down      # Stop dev containers	@echo "$(GREEN)✓ Conteneurs démarrés$(NC)"

make docker-dev-logs      # View logs (follow mode)

make docker-dev-rebuild   # Full rebuild (no cache)docker-down: ## Arrête les conteneurs Docker

```	@echo "$(YELLOW)Arrêt des conteneurs Docker...$(NC)"

	docker-compose down

### Production	@echo "$(GREEN)✓ Conteneurs arrêtés$(NC)"



```bashdocker-logs: ## Affiche les logs Docker

make docker-up            # Start prod containers	docker-compose logs -f

make docker-down          # Stop prod containers

make docker-logs          # View logsdocker-build: ## Build les images Docker

make docker-build         # Build images	@echo "$(YELLOW)Build des images Docker...$(NC)"

make docker-rebuild       # Full rebuild (no cache)	docker-compose build

make docker-clean         # Clean everything (containers, volumes, images)	@echo "$(GREEN)✓ Build terminé$(NC)"

```

docker-rebuild: ## Rebuild complet (sans cache)

### CSS Tailwind v4	@echo "$(YELLOW)Rebuild complet des images Docker...$(NC)"

	docker-compose build --no-cache

```bash	@echo "$(GREEN)✓ Rebuild terminé$(NC)"

make css-build           # Build CSS once

make css-watch           # Watch mode (outside Docker)docker-clean: ## Nettoie complètement Docker (conteneurs, volumes, images)

```	@echo "$(YELLOW)Nettoyage complet de Docker...$(NC)"

	docker-compose down -v --remove-orphans

### Prisma	docker system prune -f

	@echo "$(GREEN)✓ Nettoyage Docker terminé$(NC)"

```bash

make prisma-generate              # Generate Prisma clientclean: ## Nettoie les fichiers générés

make prisma-migrate               # Create & apply migration	@echo "$(YELLOW)Nettoyage des fichiers générés...$(NC)"

make prisma-seed                  # Seed database	rm -rf dist coverage test-results node_modules/.cache

make prisma-studio                # Open Prisma Studio	@echo "$(GREEN)✓ Nettoyage terminé$(NC)"

```

.DEFAULT_GOAL := help

---

## 🔍 Troubleshooting

### CSS non compilé dans le container

**Symptôme** : Pages sans styles

**Solution** :
```bash
# Vérifier que le CSS existe
docker compose -f docker-compose.dev.yml exec app ls -lh public/css/

# Recompiler manuellement
docker compose -f docker-compose.dev.yml exec app npm run css:build

# Rebuild container
make docker-dev-rebuild
```

### Hot reload CSS ne fonctionne pas

**Symptôme** : Changements CSS non détectés

**Vérifier** :
```bash
# Logs du watch mode
make docker-dev-logs

# Devrait voir :
# "🎨 Building Tailwind CSS..."
# "✅ CSS built successfully!"
```

**Solution** :
- Volume `./public/css` bien monté en lecture/écriture
- Permissions fichiers (chmod 644 public/css/*.css)

### Migrations Prisma échouent

**Symptôme** : App ne démarre pas, erreur migration

**Solution** :
```bash
# Entrer dans le container
docker compose -f docker-compose.dev.yml exec app sh

# Vérifier status
npx prisma migrate status

# Résoudre migration failed
npx prisma migrate resolve --rolled-back <migration_name>

# Réappliquer
npx prisma migrate deploy
```

### Container ne démarre pas

**Symptôme** : `docker compose up` échoue

**Checklist** :
1. ✅ PostgreSQL ready (voir healthcheck)
2. ✅ Packages installés (npm install)
3. ✅ Prisma client généré
4. ✅ CSS compilé (Tailwind v4)

**Logs détaillés** :
```bash
docker compose -f docker-compose.dev.yml logs app
```

### Performance lente en dev

**Symptôme** : Hot reload lent, build CSS long

**Optimisations** :
1. Utiliser Docker Desktop avec VirtioFS (Mac) ou WSL2 (Windows)
2. Exclure node_modules des volumes montés (déjà fait)
3. Vérifier RAM allouée à Docker (min 4 GB)

**Vérifier perf CSS v4** :
```bash
docker compose exec app npm run css:build
# Devrait être < 200ms (v4 = 3-8x plus rapide que v3)
```

---

## 📊 Benchmarks Performance

### Build Times (Container Alpine)

**Tailwind CSS v3 → v4** :

| Operation | v3 | v4 | Gain |
|-----------|-----|-----|------|
| Full CSS build | ~378ms | ~100ms | 3.78x |
| Incremental (new CSS) | ~44ms | ~5ms | 8.8x |
| Incremental (no new CSS) | ~35ms | ~192µs | 182x |

### Container Startup

**Production** :
- Build image : ~120s (multi-stage)
- Startup : ~15s (migrations + seed)
- Total first run : ~135s

**Développement** :
- Build image : ~90s (single stage, all deps)
- Startup : ~10s (migrations only)
- Hot reload : < 1s (instant)

### CSS Output Size

- v3 : 66.35 KB
- v4 : 78.04 KB (+17.6%)
- Raison : Forms styles custom (plugin supprimé en v4)

---

## 🔐 Sécurité

### Secrets

**⚠️ NE JAMAIS commit** :
- `.env` (local dev)
- Passwords en clair dans docker-compose.yml

**Production** : Utiliser Docker secrets ou variables d'environnement :
```bash
docker compose --env-file .env.production up
```

### User non-root

Production Dockerfile utilise user `nodejs` (UID 1001) :
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### Health Checks

**Database** :
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U taskflow"]
  interval: 10s
```

**App** :
```dockerfile
HEALTHCHECK CMD wget --spider http://localhost:3000/health || exit 1
```

---

## 📚 Ressources

### Documentation
- [Docker Compose](https://docs.docker.com/compose/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Node.js 24 Alpine](https://hub.docker.com/_/node)
- [PostgreSQL 18](https://hub.docker.com/_/postgres)

### TaskFlow Docs
- `TAILWIND_V4_MIGRATION.md` - Guide migration v3→v4
- `RESPONSIVE_PATTERNS.md` - Patterns responsive
- `CSS_ARCHITECTURE.md` - Architecture CSS

### Makefiles
```bash
make help  # Liste toutes les commandes disponibles
```

---

## ✅ Checklist Déploiement Production

Avant de déployer en production :

- [ ] **Tests** : `npm test` passe
- [ ] **E2E** : Tests navigateur OK
- [ ] **CSS Build** : `npm run css:build` sans erreurs
- [ ] **TS Build** : `npm run build` sans erreurs
- [ ] **Migrations** : Testées en staging
- [ ] **Secrets** : Variables d'env sécurisées
- [ ] **Health checks** : Endpoints `/health` OK
- [ ] **Logs** : Log level = `info` (pas `debug`)
- [ ] **Docker image** : < 300 MB
- [ ] **Tailwind v4** : CSS compilé (78 KB)

---

**🎉 Votre environnement Docker avec Tailwind v4 est prêt !**

**Commande recommandée** : `make docker-dev-up` pour démarrer en développement avec hot reload complet.
