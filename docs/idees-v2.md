# Idées V2 — SafeAnalyse.

> Ce fichier recense les idées validées pour une future version V2 de l'outil. Elles ne sont pas dans le scope V1 mais méritent d'être conservées.

---

## Plan d'action — Mode d'affichage au choix

**Concept :** Laisser l'utilisateur choisir entre deux modes d'affichage du tableau Plan d'action :

- **Mode A (V1, par défaut)** : Structure pyramide avec cellules fusionnées (rowspan). Poste → Opération → Risques en colonnes imbriquées, couleurs dégradées hiérarchiques.
- **Mode B (V2)** : En-têtes de groupe séparés (lignes-titres poste et opération, sans fusion). Chaque risque a sa propre ligne complète. Plus compatible avec le tri/filtrage avancé.

**Intérêt :** Les utilisateurs habitués à Excel préfèrent le Mode A. Ceux qui trient beaucoup par colonne préfèreront le Mode B.

**Implémentation suggérée :** Toggle de préférence dans le menu "Colonnes ▾" ou dans les paramètres, persisté en localStorage.

---

## Plan d'action — Couleurs personnalisables

**Concept :** Permettre à l'utilisateur de choisir sa palette de couleurs pour le tableau Plan d'action (hiérarchie poste/opération/risque). Actuellement fixé en bleu navy → bleu moyen → bleu pâle / violet → violet pâle pour les postes pairs.

**V2 :** Sélecteur de palette dans les paramètres ou dans le menu "Colonnes ▾". Exemples : bleu/violet (défaut), vert/teal, orange/amber, gris neutre.

---
