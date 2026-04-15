-- Migration 010 — Table evaluations_bruit (module normé M01)
-- À appliquer dans Supabase Dashboard → SQL Editor
-- Dépend de : migration 009 (module_status sur evaluations)

CREATE TABLE IF NOT EXISTS evaluations_bruit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Lien vers l'évaluation APR correspondante
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,

  -- Méthode choisie
  methode TEXT NOT NULL CHECK (methode IN ('sommaire', 'simplifiee')) DEFAULT 'simplifiee',

  -- Méthode sommaire — test de communication (0/1/2)
  niveau_estimation INTEGER CHECK (niveau_estimation IN (0, 1, 2)),

  -- Méthode simplifiée — phases stockées en JSONB
  -- Format : [{ "niveau_db": 85, "duree": "2h", "points": 25, "label": "Usinage" }, ...]
  phases JSONB DEFAULT '[]'::jsonb,
  total_points INTEGER,

  -- Résultat commun
  zone TEXT CHECK (zone IN ('vert', 'jaune', 'orange', 'rouge')),
  criticite_bruit INTEGER, -- 2, 4, 8 ou 16

  -- EPI (protecteurs individuels contre le bruit)
  epi_utilises BOOLEAN DEFAULT false,
  epi_types TEXT[] DEFAULT '{}',
  epi_snr DECIMAL(5, 2), -- SNR de l'EPI en dB

  -- Mesures de prévention choisies
  mesures_techniques TEXT[] DEFAULT '{}',
  mesures_organisationnelles TEXT[] DEFAULT '{}',
  mesures_humaines TEXT[] DEFAULT '{}',

  -- Criticité finale après EPI et mesures
  criticite_residuelle_bruit INTEGER,

  -- Statut
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'valide')),

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Une seule évaluation bruit par évaluation APR
  UNIQUE (evaluation_id)
);

-- RLS
ALTER TABLE evaluations_bruit ENABLE ROW LEVEL SECURITY;

-- Policy : accès via l'évaluation → opération → poste → entreprise → user
CREATE POLICY "Accès via entreprise" ON evaluations_bruit
  FOR ALL USING (
    evaluation_id IN (
      SELECT e.id FROM evaluations e
      JOIN operations op ON op.id = e.operation_id
      JOIN postes p ON p.id = op.poste_id
      JOIN entreprises ent ON ent.id = p.entreprise_id
      WHERE ent.user_id = auth.uid()
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_evaluations_bruit_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluations_bruit_updated_at
  BEFORE UPDATE ON evaluations_bruit
  FOR EACH ROW EXECUTE FUNCTION update_evaluations_bruit_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_evaluations_bruit_evaluation_id ON evaluations_bruit(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_bruit_statut ON evaluations_bruit(statut);

COMMENT ON TABLE evaluations_bruit IS 'Évaluations normées bruit (ED 6035 / ISO 9612 simplifiée) — Module M01';
COMMENT ON COLUMN evaluations_bruit.phases IS 'Phases de la méthode simplifiée : [{niveau_db, duree, points, label}]';
COMMENT ON COLUMN evaluations_bruit.criticite_bruit IS 'Criticité brute bruit : 2 vert / 4 jaune / 8 orange / 16 rouge';
