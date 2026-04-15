ultrathink

use library /vercel/next.js
use library /motiondotdev/motion

# Phase VITRINE V3 — Session B : Pages contenu

## Avant tout, lire impérativement

1. `CLAUDE.md` à la racine
2. `DUERP/04_DEVELOPPEMENT/BRAND.md` (charte enrichie de Phase A)
3. `DUERP/04_DEVELOPPEMENT/BRIEF_WILLIAM.md` — pour la page /a-propos
4. `DUERP/04_DEVELOPPEMENT/ETUDE_MARCHE_DUERP.md` — pour /comparatif et arguments
5. `DUERP/01_FONDATIONS/ED840_SYNTHESE.txt` — pour /outil
6. Le code de la Phase VITRINE_V3_A doit être en place (palette enrichie, header, footer)

## Contexte

Session B = créer ou refondre 5 pages contenu de la vitrine. Pas de page tarifs ici (réservée à la Session C qui dépend du nouveau pricing Stratégie C).

**Pages à traiter dans cette session :**
1. `/outil` — détail des fonctionnalités
2. `/reglementation` — DUERP en clair
3. `/a-propos` — qui est William
4. `/faq` — questions fréquentes
5. `/temoignages` — placeholders pour l'instant
6. `/contact` — formulaire + téléphone

**Ton à respecter** : rassurant, humain, pédagogique. Vulgariser sans infantiliser. Exemples concrets tirés de l'agroalimentaire / industrie.

## 1. Page `/outil`

### Hero
- Fond `bg-brand-cream`
- Titre : "Tout ce qu'il vous faut pour faire votre DUERP, et rien de plus"
- Sous-titre : "Des grilles guidées, les méthodes INRS intégrées, un PDF prêt pour l'inspection. Sans usine à gaz."

### Section "Le parcours utilisateur" (4 étapes illustrées)
1. **Créez votre entreprise** — 2 minutes, infos basiques
2. **Déclarez vos postes de travail** — un poste = un type de mission (ex: opérateur de ligne, chauffeur, commercial)
3. **Évaluez chaque risque** — grilles guidées par opération, vocabulaire accessible, méthodes INRS intégrées
4. **Exportez votre DUERP** — PDF conforme, prêt pour l'inspection du travail, conservation 40 ans automatique

Layout : 4 cards verticales, animation stagger au scroll, icône Lucide grande pour chaque (UserPlus, MapPin, ShieldCheck, FileDown).

### Section "Les 20 risques couverts" (grille)

Charge la liste depuis `DUERP/01_FONDATIONS/ED840_SYNTHESE.txt`. Affiche les 20 risques en grille 4 colonnes (desktop) / 2 (tablette) / 1 (mobile).

Chaque carte :
- Numéro ED 840
- Intitulé
- Petit badge "Module dédié" pour les risques avec module normé (Bruit, TMS, Vibrations, Charge physique, RPS, Chimique)
- Couleur de fond légère selon catégorie

Au clic : tooltip ou modale avec définition courte.

### Section "Méthodes INRS intégrées"

Cards listant les normes utilisées :
- ED 840 (référentiel des 20 risques)
- ISO 9612 (bruit)
- ED 6035 (vibrations)
- ED 6161 (TMS)
- OSEV INRS (charge physique)
- RPS-DU (risques psychosociaux)

Chaque card avec un mini-logo INRS (placeholder texte si pas dispo) + nom de la norme + description courte 2 lignes.

### Section "Export PDF conforme"

Mockup visuel du PDF (placeholder pour l'instant).

Bullet points en regard :
- Page de garde personnalisée
- Tableau APR complet par poste
- Plan de Maîtrise détaillé
- Synthèse globale avec cartographie des risques
- Versioning et conservation 40 ans automatique

### CTA final
"Découvrez l'outil en conditions réelles — demandez un échange de 15 minutes"
Bouton : "Demander un échange" → `/contact`

## 2. Page `/reglementation`

### Hero
- Titre : "Le DUERP, en clair"
- Sous-titre : "Vos obligations en tant qu'employeur, expliquées sans jargon juridique."

### Section "Qu'est-ce que le DUERP ?"
1 paragraphe pédagogique (max 4 phrases) :
> Le Document Unique d'Évaluation des Risques Professionnels (DUERP) est obligatoire pour toute entreprise dès le premier salarié. Il recense les risques auxquels vos salariés sont exposés, les mesures prises pour les réduire, et doit être mis à jour chaque année. Ce n'est pas une option : c'est le socle de votre démarche de prévention et la première chose que demande l'inspection du travail.

### Section "Vos 4 obligations principales"

4 cards horizontales, chacune avec icône + référence légale + explication simple.

1. **Article L4121-1** — Obligation générale de sécurité
   > L'employeur prend les mesures nécessaires pour assurer la sécurité et protéger la santé physique et mentale des travailleurs.

2. **Article R4121-1** — Le DUERP existe
   > Vous devez transcrire et mettre à jour les résultats de l'évaluation des risques.

3. **Article R4121-2** — Mise à jour
   > Au moins une fois par an + à chaque changement significatif (nouveau poste, nouvel équipement, accident grave).

4. **Loi du 2 août 2021** — Conservation 40 ans
   > Le DUERP et ses versions successives doivent être conservés pendant 40 ans. SafeAnalyse. le fait automatiquement.

### Section "Que se passe-t-il si je ne le fais pas ?"

Présentation factuelle, sans alarmisme :
- Amende jusqu'à 1 500€ par unité de travail (3 000€ en récidive)
- Responsabilité pénale en cas d'accident
- Faute inexcusable de l'employeur (majoration des indemnités)
- En pratique : l'inspection du travail demande le DUERP en premier lors de tout contrôle

Encart `bg-brand-warning/10 border border-brand-warning` avec icône AlertTriangle.

### Section "Les 9 principes généraux de prévention" (Article L4121-2)

Accordion (composant shadcn/ui), chaque principe avec exemple concret tiré de l'agroalimentaire :
1. Éviter les risques
2. Évaluer les risques qui ne peuvent pas être évités
3. Combattre les risques à la source
4. Adapter le travail à l'homme
5. Tenir compte de l'évolution technique
6. Remplacer ce qui est dangereux par ce qui ne l'est pas (ou moins)
7. Planifier la prévention
8. Privilégier la protection collective sur la protection individuelle
9. Donner les instructions appropriées aux travailleurs

### Section "Comment SafeAnalyse. vous aide" (fond cream-light)

3-4 points sur comment l'outil prend en charge ces obligations + CTA "Voir l'outil en détail" → `/outil`.

## 3. Page `/a-propos`

### Hero
- Fond `bg-brand-cream`
- Titre : "Un outil créé par un professionnel HSE, pour les PME industrielles"
- Sous-titre : "Je m'appelle William Maréchal, et j'ai conçu SafeAnalyse. en partant des galères que j'ai vues sur le terrain."
- Photo de William à droite (placeholder rond avec initiales WM pour l'instant)

### Section "Mon parcours"

Texte narratif (pas de bullets) :
> Diplôme BUT Hygiène Sécurité Environnement obtenu à l'IUT de Lorient en septembre 2026. Pendant ces trois années, j'ai été formé à tous les risques professionnels — bruit, vibrations, TMS, RPS, risque chimique — et j'ai passé deux ans en alternance au service QSE de MGD Nature, une PME agroalimentaire bretonne. C'est là que j'ai vu la réalité du DUERP en PME : des tableurs Excel à rallonge, des modèles Word qu'on recycle d'année en année sans vraiment les retravailler, et un dirigeant qui n'a pas le temps de se plonger dans la réglementation.

> En parallèle, je suis pompier volontaire — la prévention des risques, c'est aussi une vocation.

### Section "Le déclic"

Encart citation grand format :
> « J'ai compris qu'avec un outil pensé par un HSE et bien conçu, la mise à jour du DUERP pouvait devenir simple — sans sacrifier la rigueur. C'est ce que j'ai voulu construire avec SafeAnalyse. »
> — William Maréchal

### Section "Ma démarche"

3 valeurs en cards :
- **Accessibilité** — Un outil que tout dirigeant de PME peut prendre en main, pas seulement les ergonomes diplômés.
- **Pédagogie** — On vous explique les méthodes (INRS, Code du travail), on ne vous assomme pas avec du jargon.
- **Proximité** — Un humain derrière l'outil. Si vous bloquez, je suis joignable.

### Section "Accompagnement sur site"

> Pour les PME du Morbihan et alentours, je peux me déplacer pour réaliser le DUERP avec vous, directement dans l'outil. Vous gardez votre compte SafeAnalyse. : ce qu'on construit ensemble vous appartient.

Tarifs résumés (pas le détail — renvoyer vers /tarifs) :
- Forfait sur devis selon taille de l'entreprise
- Inclut 2 ans de SaaS Pack Premium
- Frais kilométriques au-delà de 50 km autour de Lorient

CTA : "Demander un devis" → `/contact`

### Section "Mes domaines d'intervention"

Liste avec icônes Lucide :
- APR / EVR généraliste
- Module Bruit (mesures, ISO 9612)
- Module TMS / charge physique
- Module Vibrations
- Module RPS
- Module Chimique / ATEX
- Risque électrique / habilitations
- Plan de prévention / protocole sécurité
- Formation sécurité

### Section Contact direct

Encart final avec :
- Email
- Téléphone
- LinkedIn

(Les vraies coordonnées seront ajoutées par William, pour l'instant placeholders `william@safeanalyse.fr`, `06 XX XX XX XX`, lien LinkedIn vide)

## 4. Page `/faq`

Accordion shadcn/ui, 12 questions regroupées en 3 catégories :

### Sur le DUERP
1. Le DUERP est-il vraiment obligatoire pour les TPE ?
2. À quelle fréquence faut-il le mettre à jour ?
3. Comment l'inspection du travail vérifie-t-elle ?
4. Quelles sont les sanctions concrètes ?

### Sur SafeAnalyse.
5. Combien de temps pour faire mon premier DUERP avec SafeAnalyse. ?
6. Faut-il être expert HSE pour utiliser l'outil ?
7. Mon DUERP est-il vraiment conforme avec votre PDF ?
8. Qu'est-ce qu'un module normé (Bruit, TMS…) ?
9. Mes données sont-elles en sécurité ?

### Sur l'offre
10. Quelle différence entre Pack Industrie et Pack Premium ?
11. Comment fonctionne l'accompagnement sur site ?
12. Peut-on annuler à tout moment ?

(Réponses à rédiger par toi avec le ton SafeAnalyse. — pédagogique, factuel, sans pression de vente.)

## 5. Page `/temoignages`

### Hero
- Titre : "Ils nous font confiance"
- Sous-titre : "SafeAnalyse. est en lancement — les premiers retours arrivent bientôt."

### Section "Bientôt ici"

Affichage transparent, sans tricher : un encart honnête disant que les premiers témoignages seront publiés courant 2026, avec un appel aux clients fondateurs.

```tsx
<div className="bg-brand-cream-light border border-brand-sand rounded-2xl p-12 max-w-3xl mx-auto text-center">
  <Sparkles className="w-12 h-12 text-brand-gold-light mx-auto mb-6" />
  <h2 className="text-3xl font-bold text-brand-navy mb-4">Vous serez peut-être le premier ?</h2>
  <p className="text-lg text-brand-ink-soft mb-8">
    SafeAnalyse. accompagne ses premiers clients en 2026. En tant que client fondateur, vous bénéficiez d'un accompagnement renforcé — et votre retour aidera à façonner l'outil pour les suivants.
  </p>
  <Button variant="cta" size="lg">Devenir client fondateur</Button>
</div>
```

### Section secondaire (optionnel)
Si quelques témoignages existent : 3 cards avec photo + nom + entreprise + citation + secteur + taille. Sinon, ne pas afficher.

## 6. Page `/contact`

### Hero
- Titre : "Discutons de votre DUERP"
- Sous-titre : "Un échange de 15 minutes pour comprendre votre besoin et voir si SafeAnalyse. peut vous aider."

### Section principale — 2 colonnes

**Colonne gauche : formulaire**
Champs (React Hook Form + Zod) :
- Nom complet (requis)
- Email pro (requis)
- Téléphone (optionnel)
- Entreprise + taille (select : 1-10, 11-50, 51-250, 250+)
- Secteur d'activité (select : Agroalimentaire, BTP, Restauration, Industrie, Services, Autre)
- Message (textarea, optionnel)
- Case à cocher RGPD (requis)

Bouton "Envoyer ma demande" en CTA or.

À la soumission : envoi vers une Server Action qui :
1. Valide via Zod
2. Envoie un email à William (via Resend ou équivalent — si pas configuré, juste enregistre en DB et notifie)
3. Affiche un toast de succès + remplace le formulaire par un message de remerciement

**Colonne droite : infos directes**
- Email : `william@safeanalyse.fr` (placeholder)
- Téléphone : `06 XX XX XX XX` (placeholder)
- Zone d'intervention : Morbihan + Bretagne sud (déplacement ailleurs sur devis)
- Réponse sous 24h ouvrées
- Encart "Pourquoi me contacter ?"
  - Demander une démo personnalisée
  - Discuter d'une prestation sur site
  - Question sur l'outil ou la conformité
  - Devenir client fondateur

## 7. Animations Phase B

Reprendre exactement les patterns de la Phase A :
- Fade-in au scroll partout (sections)
- Stagger sur les listes (étapes, risques, valeurs)
- Hover subtil sur les cards
- Pas de scroll-driven sticky storytelling sur ces pages — c'était réservé au hero de la landing pour rester premium et pas surcharger

## C'est fini quand

- [ ] `/outil` — 6 sections en place avec contenu défini
- [ ] `/outil` — grille des 20 risques chargée depuis ED840_SYNTHESE.txt
- [ ] `/reglementation` — hero + 4 obligations + 9 principes en accordion + section sanctions
- [ ] `/a-propos` — bio narrative William + valeurs + accompagnement + contact direct
- [ ] `/faq` — accordion 12 questions catégorisées avec réponses rédigées
- [ ] `/temoignages` — encart "vous serez peut-être le premier"
- [ ] `/contact` — formulaire fonctionnel + infos directes + Server Action validation
- [ ] Animations cohérentes avec Phase A
- [ ] Pages responsives desktop + tablette
- [ ] `npm run build` passe

## Ne PAS toucher

- Pas la page `/tarifs` (Session C)
- Pas la landing `/` (faite en Session A)
- Pas le dashboard / l'outil
- Pas la nav et le footer (faits en Session A)

## À la fin

Mettre à jour `CLAUDE.md` section 6 : cocher `[x] PHASE_VITRINE_V3_B`.

## Commit

```bash
git add .
git commit -m "Vitrine V3 B - pages outil/reglementation/a-propos/faq/temoignages/contact"
git push
```
