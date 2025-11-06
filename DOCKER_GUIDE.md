# 🐳 Guide Docker - TaskFlow

## 🚀 Démarrage Rapide

### Mode Développement (Recommandé)

```bash
# Lancer l'application avec hot reload
make docker-dev-up

# Voir les logs en temps réel
make docker-dev-logs

# Arrêter les conteneurs
make docker-dev-down
```

**URL de l'application** : http://localhost:3000

---

## 📋 Commandes Docker Disponibles

### Mode Développement

```bash
make docker-dev-up        # Démarre les conteneurs (app + PostgreSQL)
make docker-dev-down      # Arrête les conteneurs
make docker-dev-logs      # Affiche les logs en temps réel
make docker-dev-restart   # Redémarre les conteneurs
```

### Mode Production

```bash
make docker-up            # Démarre en mode production
make docker-down          # Arrête les conteneurs
make docker-logs          # Affiche les logs
```

### Nettoyage

```bash
make docker-clean         # Supprime conteneurs + volumes + données
```

---

## 🔧 Qu'est-ce qui se passe quand vous lancez Docker ?

### Architecture

```
┌─────────────────────────────────────┐
│  Navigateur (http://localhost:3000) │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Container App (Node.js 24)         │
│  - Express + EJS + HTMX             │
│  - Hot reload activé                │
│  - Port 3000                        │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Container DB (PostgreSQL 18)       │
│  - Port 5433 (externe)              │
│  - Port 5432 (interne)              │
└─────────────────────────────────────┘
```

### Étapes du démarrage

1. **Build de l'image Docker** (première fois seulement)
   - Installation Node.js 24
   - Installation des dépendances (npm install)
   - Génération du client Prisma
   - Compilation du CSS Tailwind

2. **Démarrage PostgreSQL**
   - Création de la base de données `taskflow_dev`
   - Health check (attente que la DB soit prête)

3. **Démarrage de l'application**
   - Connexion à PostgreSQL
   - Application des migrations Prisma
   - Remplissage avec des données de test (seed)
   - Démarrage du serveur Express sur port 3000

---

## 📁 Volumes montés (Hot Reload)

Les dossiers suivants sont montés depuis votre machine vers le container :

```yaml
./src       → /app/src          # Code TypeScript (hot reload)
./views     → /app/views        # Templates EJS (hot reload)
./public    → /app/public       # CSS, JS, images (hot reload)
./locales   → /app/locales      # Traductions (hot reload)
./prisma    → /app/prisma       # Schema Prisma
```

**Avantage** : Vous modifiez un fichier sur votre machine → Le container le détecte automatiquement !

---

## ✅ Vérifier que tout fonctionne

### 1. Vérifier les conteneurs en cours

```bash
docker ps
```

Vous devriez voir :
- `taskflow_dev_app` (port 3000)
- `taskflow_dev_db` (port 5433)

### 2. Tester l'application

```bash
curl http://localhost:3000/health
# Devrait retourner : {"status":"healthy","timestamp":"..."}
```

### 3. Voir les logs de l'application

```bash
make docker-dev-logs
```

### 4. Ouvrir dans le navigateur

http://localhost:3000

---

## 🐛 Dépannage

### Problème : "Port 3000 déjà utilisé"

```bash
# Trouver le processus qui utilise le port
lsof -i :3000

# Arrêter les conteneurs existants
make docker-dev-down

# Ou arrêter le processus Node local
pkill -f "node.*server"
```

### Problème : "Cannot connect to PostgreSQL"

```bash
# Vérifier que le conteneur DB est démarré
docker ps | grep taskflow_dev_db

# Voir les logs de la base de données
docker compose -f docker-compose.dev.yml logs db

# Redémarrer les conteneurs
make docker-dev-restart
```

### Problème : "CSS non compilé"

```bash
# Entrer dans le conteneur
docker compose -f docker-compose.dev.yml exec app sh

# Compiler manuellement
npm run css:build

# Vérifier le fichier
ls -lh public/css/output.css
```

### Problème : "Migrations échouent"

```bash
# Vérifier l'état des migrations
docker compose -f docker-compose.dev.yml exec app npx prisma migrate status

# Réappliquer les migrations
docker compose -f docker-compose.dev.yml exec app npx prisma migrate deploy

# Régénérer le client Prisma
docker compose -f docker-compose.dev.yml exec app npx prisma generate
```

---

## 🔄 Workflow de développement avec Docker

### 1. Démarrer l'environnement

```bash
make docker-dev-up
make docker-dev-logs  # Dans un autre terminal
```

### 2. Modifier le code

Éditez vos fichiers normalement :
- `src/**/*.ts` → Hot reload automatique
- `views/**/*.ejs` → Rafraîchir le navigateur
- `public/css/*.css` → CSS recompilé automatiquement

### 3. Tester

```bash
# Les tests tournent localement (pas dans Docker)
npm test
```

### 4. Arrêter

```bash
make docker-dev-down
```

---

## 📊 Comparaison Docker vs Local

| Critère | Local (`npm run dev`) | Docker (`make docker-dev-up`) |
|---------|----------------------|-------------------------------|
| **Setup** | Rapide (si Node installé) | Plus long (build image) |
| **PostgreSQL** | Vous devez l'installer | ✅ Automatique (container) |
| **Hot reload** | ✅ Oui | ✅ Oui |
| **Isolation** | Utilise votre Node local | ✅ Environnement isolé |
| **Port** | 3001 | 3000 |
| **Idéal pour** | Développement rapide | Production-like, CI/CD |

---

## 🎯 Recommandation

### Pour le développement quotidien :
**Utilisez le mode local** (`npm run dev`) car :
- ✅ Plus rapide à démarrer
- ✅ Utilise les mêmes outils que votre IDE
- ✅ Debugging plus facile

### Pour tester en conditions production :
**Utilisez Docker** (`make docker-dev-up`) car :
- ✅ Environnement isolé
- ✅ PostgreSQL inclus
- ✅ Même config que la production

---

## 📚 Ressources

- **docker-compose.dev.yml** : Configuration développement
- **docker-compose.yml** : Configuration production
- **Dockerfile.dev** : Image Docker développement
- **Dockerfile** : Image Docker production

**🎉 Votre application Docker est prête !**

Commande rapide : `make docker-dev-up && make docker-dev-logs`
