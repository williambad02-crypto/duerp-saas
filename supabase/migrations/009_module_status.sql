-- Migration 009 — Colonnes module normé sur evaluations
-- À appliquer dans Supabase Dashboard → SQL Editor

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS module_status TEXT
  CHECK (module_status IN ('non_initie', 'maitrise', 'creuser'));

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS preselection_responses JSONB;

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS module_completed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN evaluations.module_status IS
  'Statut module normé : NULL = non initié, maitrise = 0 OUI présélection, creuser = 1+ OUI';
COMMENT ON COLUMN evaluations.preselection_responses IS
  'Réponses aux 3 questions de présélection — tableau de booléens [q1, q2, q3]';
COMMENT ON COLUMN evaluations.module_completed_at IS
  'Date de la dernière présélection ou complétion du module normé';

-- Index pour requêtes rapides par statut module
CREATE INDEX IF NOT EXISTS idx_evaluations_module_status ON evaluations(module_status)
  WHERE module_status IS NOT NULL;
