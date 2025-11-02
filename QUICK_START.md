# 🚀 Quick Start - TaskFlow

**Temps estimé**: 5 minutes pour avoir l'application qui tourne

---

## ⚡ Démarrage Rapide (3 étapes)

### Étape 1: Démarrer les services Docker

```bash
docker compose up -d
```

**Vérification** : La base de données PostgreSQL doit être accessible sur le port 5433

### Étape 2: Démarrer le serveur de développement

```bash
npm run dev
```

**Attendez de voir ces messages** :
```
✅ Built successfully! Size: 139.71 KB
[INFO] Database connected successfully
[INFO] Server started {"port":3001,"host":"0.0.0.0","env":"development"}
```

⚠️ **IMPORTANT** : Laissez ce terminal ouvert. Le serveur doit rester actif.

### Étape 3: Ouvrir dans le navigateur

Naviguez vers : **http://localhost:3001**

**Vous devriez voir** :
- ✅ Interface stylée avec design glassmorphism
- ✅ Navigation header
- ✅ Page de connexion/inscription

---

## 🧪 Tester que tout fonctionne

### Test 1: CSS chargé

Ouvrez DevTools (F12) → Network → Rechargez (Ctrl+R)

Vous devez voir : `output.css` avec statut **200 OK** (143 KB)

### Test 2: HTMX disponible

Console navigateur (F12) :
```javascript
htmx.version
// Doit afficher: "1.9.10"
```

### Test 3: Alpine.js disponible

Console navigateur :
```javascript
Alpine.version
// Doit afficher: "3.x.x"
```

---

## 🔧 Commandes Utiles

### Développement
```bash
npm run dev              # Démarrer serveur + watch CSS
npm run css:build        # Build CSS uniquement
npm test                 # Lancer tests
npm run lint             # Vérifier code
```

### Base de données
```bash
npm run prisma:migrate   # Créer/appliquer migrations
npm run prisma:studio    # Interface DB visuelle
npm run prisma:seed      # Peupler la DB avec données de test
```

### Docker
```bash
docker compose up -d     # Démarrer services
docker compose down      # Arrêter services
docker compose logs -f   # Voir les logs
```

---

## 🚨 Problèmes Courants

### ❌ "Cannot connect to database"

**Solution** :
```bash
docker compose down
docker compose up -d
# Attendre 5 secondes
npm run dev
```

### ❌ "Port 3001 already in use"

**Solution** :
```bash
# Tuer le processus sur le port 3001
lsof -ti:3001 | xargs kill -9
npm run dev
```

### ❌ "CSS ne charge pas"

**Solution** :
```bash
# Reconstruire le CSS
npm run css:build
# Vider cache navigateur: Ctrl+Shift+R
```

### ❌ "Module not found"

**Solution** :
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Comptes de Test

Après `npm run prisma:seed` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| Member | user@example.com | user123 |

---

## 🎯 Prochaines Étapes

1. ✅ Se connecter avec un compte de test
2. ✅ Explorer le dashboard
3. ✅ Créer une tâche
4. ✅ Tester les filtres HTMX
5. ✅ Basculer entre thème clair/sombre

---

## 📚 Documentation Complète

Pour plus de détails :
- **FRONTEND_FIX_GUIDE.md** : Guide de résolution problèmes frontend
- **README.md** : Documentation complète
- **ROADMAP.md** : Plan de développement
- **docs/DESIGN_SYSTEM_V2.md** : Guide design system

---

## 💡 Astuce Pro

Gardez 2 terminaux ouverts :
1. **Terminal 1** : `npm run dev` (serveur)
2. **Terminal 2** : Pour les commandes (git, tests, etc.)

---

**🎉 Votre application est prête ! Bon développement !**
