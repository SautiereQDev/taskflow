# Dashboard - Architecture Informationnelle Optimisée

**Date**: 8 novembre 2025  
**Version**: 2.0  
**Objectif**: Éliminer les redondances et maximiser la valeur ajoutée de chaque métrique

---

## 🎯 Principe Directeur

**Chaque information affichée doit avoir une valeur ajoutée unique et actionnable.**

---

## 📊 Structure Optimisée

### **1. Métriques Clés (4 Cards en Haut)**

Rôle : **Vue d'ensemble rapide** des KPIs principaux

#### Card 1 : Tâches Totales
- **Métrique principale** : Nombre total de tâches
- **Valeur ajoutée** : Contexte global / Vue macro
- **Détail** : Répartition TODO/IN_PROGRESS/DONE (points de couleur + chiffres)
- **Pourquoi** : Donne une vue snapshot de la distribution sans barre de progression redondante

```ejs
✅ Total : 47 tâches
📊 Répartition : 12 TODO • 15 En cours • 20 Faites
```

#### Card 2 : En Cours
- **Métrique principale** : Tâches IN_PROGRESS
- **Valeur ajoutée** : Focus sur l'activité immédiate
- **Détail** : Mes tâches en cours / Total en cours (personnalisation)
- **Barre** : Ma part du travail en cours
- **Pourquoi** : Permet de voir si l'utilisateur est surchargé ou non

```ejs
✅ 15 en cours
📊 5 vous sont assignées (33%)
```

#### Card 3 : Complétées
- **Métrique principale** : Tâches DONE
- **Valeur ajoutée** : Performance historique
- **Détail** : Complétées cette semaine (vélocité récente)
- **Barre** : Progression hebdomadaire (max 10 = 100%)
- **Pourquoi** : Montre la productivité récente de l'équipe

```ejs
✅ 20 terminées
📊 8 cette semaine
```

#### Card 4 : En Retard
- **Métrique principale** : Tâches OVERDUE
- **Valeur ajoutée** : Identification des risques
- **Détail** : MES tâches en retard / Total en retard
- **Barre** : Ma part des tâches en retard
- **Pourquoi** : Alerte personnalisée sur ce qui nécessite mon attention urgente

```ejs
🚨 3 en retard
📊 2 vous sont assignées (67%)
```

---

### **2. Progression Générale (Section Gauche)**

Rôle : **KPIs équipe et vélocité**

#### Taux de Complétion Global
- **Métrique** : % de tâches terminées / total
- **Valeur ajoutée** : KPI principal de santé du projet
- **Pourquoi** : Indicateur de performance global

```ejs
✅ 43% de complétion
```

#### Vélocité Hebdomadaire
- **Métriques** : Créées vs Terminées (7 derniers jours)
- **Valeur ajoutée** : Tendance d'activité de l'équipe
- **Pourquoi** : Permet de voir si on "suit" ou si le backlog augmente

```ejs
📈 Créées : 12 | Terminées : 8
```

#### Vélocité Nette
- **Métrique** : Différence (Terminées - Créées)
- **Valeur ajoutée** : Indicateur de santé du backlog
- **Pourquoi** : Alerte visuelle si le backlog augmente (négatif) ou diminue (positif)

```ejs
⚠️ Vélocité nette : -4
→ "Attention : Le backlog augmente."
```

---

### **3. Points d'Attention (Section Droite)**

Rôle : **Alertes et contexte équipe**

#### Alertes Contextuelles
1. **Tâches en retard** : Alerte prioritaire
2. **Tâches en cours** : Rappel de suivi
3. **Membres actifs** : Contexte d'équipe (déplacé depuis Progression)

**Pourquoi les Utilisateurs Actifs sont ici** :
- Pas une métrique de progression
- Contexte d'équipe (qui travaille actuellement)
- Utile pour savoir si on peut déléguer ou demander de l'aide

---

## 📈 Élimination des Redondances

### ❌ Supprimé

1. **Card Total : "Tâches actives" + barre de progression**
   - **Pourquoi** : Redondant avec IN_PROGRESS + TODO (déjà affichés séparément)
   - **Remplacé par** : Répartition TODO/IN_PROGRESS/DONE en mini-indicateurs

2. **Card Overdue : "Besoin d'attention" + message générique**
   - **Pourquoi** : Peu actionnable ("Urgent" vs "Parfait" n'apporte pas d'info)
   - **Remplacé par** : MES tâches en retard (personnalisé + actionnable)

3. **Progression : "Utilisateurs actifs"**
   - **Pourquoi** : Pas une métrique de progression mais un contexte d'équipe
   - **Déplacé vers** : Section "Points d'Attention"

### ✅ Ajouté

1. **Vélocité Nette** (Section Progression)
   - **Valeur** : Alerte si le backlog augmente (créées > terminées)
   - **Actionnable** : Permet d'ajuster les priorités

2. **Répartition TODO/IN_PROGRESS/DONE** (Card Total)
   - **Valeur** : Vue snapshot de la distribution sans barre inutile
   - **Compact** : Points de couleur + chiffres

3. **Personnalisation des Cards**
   - **En Cours** : MA part du travail en cours
   - **En Retard** : MES tâches en retard
   - **Valeur** : Contexte personnel actionnable

---

## 🎨 Design Patterns

### Indicateurs de Statut
```ejs
<!-- Répartition compacte avec points de couleur -->
<div class="flex items-center gap-1">
  <div class="w-2 h-2 rounded-full bg-info"></div>
  <span>12 TODO</span>
</div>
```

### Barres de Progression Personnalisées
```ejs
<!-- Barre montrant MA part du total -->
<div class="w-full bg-base-200 rounded-full h-2 overflow-hidden">
  <div class="bg-warning h-2 rounded-full"
       style="width: <%= Math.min(myTasks / totalTasks * 100, 100) %>%">
  </div>
</div>
```

### Alerte de Vélocité
```ejs
<!-- Indicateur visuel de santé du backlog -->
<div class="<%= isPositive ? 'bg-success/10' : 'bg-warning/10' %>">
  <span class="<%= isPositive ? 'text-success' : 'text-warning' %>">
    <%= isPositive ? '+' : '' %><%= netVelocity %>
  </span>
  <div class="text-xs">
    <%= isPositive ? 'Excellent ! Le backlog diminue.' : 'Attention : Le backlog augmente.' %>
  </div>
</div>
```

---

## 📋 Checklist de Valeur Ajoutée

Avant d'ajouter une métrique, vérifier :

- [ ] **Unique** : L'information n'est pas déjà affichée ailleurs
- [ ] **Actionnable** : L'utilisateur peut agir en fonction de cette info
- [ ] **Contextualisée** : L'information a un sens dans son emplacement
- [ ] **Compréhensible** : Pas besoin d'explication pour comprendre
- [ ] **Pertinente** : L'information apporte de la valeur au rôle de la section

---

## 🎯 Hiérarchie de l'Information

```
Dashboard
├── Hero (Motivation + Actions Rapides)
│
├── Métriques Clés (Vue d'Ensemble Rapide)
│   ├── Total (Vue macro)
│   ├── En Cours (Activité actuelle)
│   ├── Complétées (Performance)
│   └── En Retard (Risques)
│
├── Progression & Alertes (Analyse Détaillée)
│   ├── Progression (KPIs équipe + vélocité)
│   └── Alertes (Points d'attention + contexte)
│
├── Distribution (Analyse Stratégique)
│   ├── Par Statut
│   └── Par Priorité
│
├── Flux de Tâches (Tâches Actionables)
│   ├── Prioritaires
│   ├── À Venir
│   └── Mes Tâches
│
└── Capacité Équipe (Management)
    └── Charge par Membre
```

---

## 🔄 Évolutions Futures

### Phase 2 (Optionnel)
- **Tendances** : Flèches ↑↓ pour montrer l'évolution par rapport à la semaine précédente
- **Temps moyen de complétion** : Métrique de performance dans Progression
- **Prédictions** : Estimation de fin de sprint basée sur la vélocité actuelle

### Phase 3 (Analytics)
- **Graphiques** : Évolution des métriques sur 30 jours
- **Heatmap** : Jours les plus productifs de l'équipe
- **Bottlenecks** : Identification des tâches bloquées trop longtemps

---

**Ce document sert de référence pour maintenir une architecture informationnelle cohérente et sans redondances.**
