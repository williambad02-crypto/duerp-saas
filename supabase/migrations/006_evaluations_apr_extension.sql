-- ============================================================
-- Migration 006 — Extension table evaluations pour le modèle APR complet
--
-- La table evaluations existante supporte la cotation G×P (risques aigus)
-- et le stockage JSON pour les modules chroniques.
-- Cette migration ajoute les colonnes manquantes pour le tableau APR complet :
-- identification, chaîne de l'accident (Danger → Dommage), durée d'exposition.
--
-- Le contrainte UNIQUE existante est remplacée par deux index partiels :
--   · Un pour les évaluations module (ex: M01_BRUIT) — un par (operation, module, type)
--   · Un pour les lignes APR standard — un par (operation, risque_ed840, type)
-- ============================================================

-- ── Colonnes APR ────────────────────────────────────────────────────────────

-- Fiche ED840 sélectionnée (1 à 20)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS numero_risque_ed840 INTEGER
  CHECK (numero_risque_ed840 BETWEEN 1 AND 20);

-- Identifiant lisible généré côté application (ex: UT01-R003)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS identifiant_auto TEXT;

-- Chaîne de l'accident (colonnes APR)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS danger              TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS situation_dangereuse TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evenement_dangereux  TEXT; -- aigus uniquement
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS dommage              TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS siege_lesions        TEXT;

-- Durée d'exposition (DE) — cotation CHRONIQUE APR standard (G × DE)
-- 1=rare, 2=occasionnel, 3=fréquent, 4=permanent
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS duree_exposition SMALLINT
  CHECK (duree_exposition BETWEEN 1 AND 4);

-- ── Contrainte d'unicité ─────────────────────────────────────────────────────

-- Supprimer l'ancienne contrainte (empêchait plusieurs lignes APR par opération)
ALTER TABLE evaluations
  DROP CONSTRAINT IF EXISTS evaluations_operation_module_type_unique;

-- Index pour les évaluations module-spécifiques (M01_BRUIT, M02_VIBRATIONS…)
-- → un seul enregistrement par (opération, module, type)
CREATE UNIQUE INDEX IF NOT EXISTS evaluations_module_unique
  ON evaluations(operation_id, code_module, type_risque)
  WHERE code_module != 'APR';

-- Index pour les lignes APR standard
-- → un seul enregistrement par (opération, fiche ED840, type : aigu ou chronique)
CREATE UNIQUE INDEX IF NOT EXISTS evaluations_apr_unique
  ON evaluations(operation_id, numero_risque_ed840, type_risque)
  WHERE code_module = 'APR' AND numero_risque_ed840 IS NOT NULL;
