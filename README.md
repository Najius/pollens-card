# Pollens Card pour Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/Najius/pollens-card.svg)](https://github.com/Najius/pollens-card/releases)
[![License](https://img.shields.io/github/license/Najius/pollens-card.svg)](LICENSE)

Une carte moderne et élégante pour visualiser les niveaux de pollen dans Home Assistant.

## ✨ Fonctionnalités

- 🌾 **6 Types de Pollen** - Graminées, Aulne, Bouleau, Olivier, Ambroisie, Armoise
- 📊 **Visualisation Circulaire** - Anneaux de progression SVG animés
- 📅 **Comparaison Aujourd'hui/Demain** - Côte à côte pour chaque type
- 🎨 **Code Couleur Dynamique** - Vert (Faible) → Jaune (Modéré) → Orange (Élevé) → Rouge (Très élevé)
- 💫 **Design Moderne** - Gradient élégant avec glass morphism
- 📱 **Responsive** - S'adapte à tous les écrans
- 🎭 **Animations Fluides** - Transitions smooth et hover effects
- 📏 **Concentrations μg/m³** - Affichage des valeurs précises

## 📦 Installation

### HACS (Recommandé)

1. Ouvrez HACS dans votre instance Home Assistant
2. Cliquez sur "Frontend"
3. Cliquez les trois points en haut à droite
4. Sélectionnez "Custom repositories"
5. Ajoutez cette URL: `https://github.com/Najius/pollens-card`
6. Sélectionnez la catégorie: "Lovelace"
7. Cliquez "Add"
8. Trouvez "Pollens Card" dans HACS et installez-le
9. Redémarrez Home Assistant

### Installation Manuelle

1. Téléchargez `pollens-card.js` depuis la [dernière release](https://github.com/Najius/pollens-card/releases)
2. Copiez-le dans votre dossier `config/www`
3. Ajoutez la ressource dans votre dashboard Lovelace:
   ```yaml
   resources:
     - url: /local/pollens-card.js
       type: module
   ```
4. Redémarrez Home Assistant

## 🚀 Utilisation

### Configuration Simple

```yaml
type: custom:pollens-card
title: Pollen
location: Bordeaux
```

## 📋 Entités Requises

La carte utilise automatiquement vos entités pollen avec le format:
- `sensor.concentration_[type]_[location]` et `sensor.concentration_[type]_[location]_j_1`
- `sensor.niveau_[type]_[location]` et `sensor.niveau_[type]_[location]_j_1`

Types supportés: graminé, aulne, bouleau, olivier, ambroisie, armoise

## 🎨 Design

- Gradient moderne violet (#667eea → #764ba2)
- Glass morphism avec backdrop blur
- Anneaux circulaires SVG animés
- Code couleur dynamique (1-4)
- Typography Google Sans

## 🛠️ Développement

```bash
git clone https://github.com/Najius/pollens-card.git
cd pollens-card
npm install
npm run build
```

## 📝 License

MIT License - voir le fichier [LICENSE](LICENSE)
