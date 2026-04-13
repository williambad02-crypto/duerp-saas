-- ============================================================
-- DUERP SaaS — Schéma initial
-- Migration 001 — À valider avant exécution
-- ============================================================

-- Extension UUID (déjà activée sur Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE : entreprises
-- Profil de l'entreprise, lié à auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS entreprises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom             TEXT NOT NULL,
  siret           TEXT,
  secteur_activite TEXT,
  effectif        INTEGER,
  adresse         TEXT,
  code_postal     TEXT,
  ville           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT entreprises_user_id_unique UNIQUE (user_id) -- 1 entreprise par utilisateur (V1)
);

-- ============================================================
-- TABLE : postes
-- Postes de travail (= Unités de Travail au sens réglementaire)
-- ============================================================
CREATE TABLE IF NOT EXISTS postes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entreprise_id  UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  nom            TEXT NOT NULL,
  description    TEXT,
  ordre          INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : operations
-- Opérations par poste. L'unité d'analyse de base du DUERP.
-- est_transversale = TRUE → opération "Toutes opérations"
--   (risques uniformes sur tout le poste : bruit ambiant, RPS...)
-- ============================================================
CREATE TABLE IF NOT EXISTS operations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poste_id         UUID NOT NULL REFERENCES postes(id) ON DELETE CASCADE,
  nom              TEXT NOT NULL,
  description      TEXT,
  est_transversale BOOLEAN NOT NULL DEFAULT FALSE,
  ordre            INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE : preselections
-- Réponses aux 3 questions de présélection par (opération × module)
-- 0 OUI → module ignoré (criticité 1 automatique)
-- 1+ OUI → module complet déclenché
-- ============================================================
CREATE TABLE IF NOT EXISTS preselections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id  UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  code_module   TEXT NOT NULL,  -- ex: 'M01_BRUIT', 'M02_VIBRATIONS'...
  question_1    BOOLEAN NOT NULL DEFAULT FALSE,
  question_2    BOOLEAN NOT NULL DEFAULT FALSE,
  question_3    BOOLEAN NOT NULL DEFAULT FALSE,
  module_actif  BOOLEAN NOT NULL DEFAULT FALSE, -- calculé : TRUE si au moins 1 OUI
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT preselections_operation_module_unique UNIQUE (operation_id, code_module)
);

-- ============================================================
-- TABLE : evaluations
-- Une évaluation = un couple (opération × module de risque)
-- Contient la cotation brute (G × P pour risque aigu)
-- Les risques chroniques utilisent donnees_module (JSON)
-- ============================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id    UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  code_module     TEXT NOT NULL,
  type_risque     TEXT NOT NULL CHECK (type_risque IN ('aigu', 'chronique')),
  statut          TEXT NOT NULL DEFAULT 'brouillon'
                  CHECK (statut IN ('brouillon', 'en_cours', 'termine')),

  -- Cotation risque AIGU : Criticité = Gravité × Probabilité
  gravite         INTEGER CHECK (gravite BETWEEN 1 AND 5),
  probabilite     INTEGER CHECK (probabilite BETWEEN 1 AND 4),
  criticite_brute NUMERIC(5,2), -- gravite × probabilite

  -- Données spécifiques au module (méthodes chroniques, etc.)
  donnees_module  JSONB,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT evaluations_operation_module_type_unique
    UNIQUE (operation_id, code_module, type_risque)
);

-- ============================================================
-- TABLE : plans_maitrise
-- Mesures existantes + coefficient PM
-- Criticité résiduelle = criticité brute × coefficient_pm
-- ============================================================
CREATE TABLE IF NOT EXISTS plans_maitrise (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id           UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,

  -- Mesures existantes (classification T.H.O. + EPI)
  mesures_techniques      TEXT,
  mesures_humaines        TEXT,
  mesures_organisationnelles TEXT,
  mesures_epi             TEXT,

  -- Coefficient PM : 0.0 (supprimé) → 1.0 (aucune mesure)
  -- Valeurs possibles : 0.0, 0.25, 0.5, 0.75, 1.0
  coefficient_pm          NUMERIC(3,2) NOT NULL DEFAULT 1.0
                          CHECK (coefficient_pm IN (0.0, 0.25, 0.5, 0.75, 1.0)),
  criticite_residuelle    NUMERIC(5,2), -- criticite_brute × coefficient_pm

  -- Plan d'action (mesures à venir)
  actions_prevues         TEXT,
  coefficient_pm_cible    NUMERIC(3,2)
                          CHECK (coefficient_pm_cible IN (0.0, 0.25, 0.5, 0.75, 1.0)),
  criticite_finale        NUMERIC(5,2), -- criticite_brute × coefficient_pm_cible
  echeance                DATE,
  responsable             TEXT,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT plans_maitrise_evaluation_unique UNIQUE (evaluation_id)
);

-- ============================================================
-- TABLE : abonnements
-- Préparation pour Stripe (Phase 2A)
-- Un abonnement par utilisateur
-- ============================================================
CREATE TABLE IF NOT EXISTS abonnements (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,

  -- Plan et statut
  plan                    TEXT NOT NULL DEFAULT 'decouverte'
                          CHECK (plan IN ('decouverte', 'essentiel', 'consulting')),
  statut                  TEXT NOT NULL DEFAULT 'trial'
                          CHECK (statut IN ('trial', 'active', 'past_due', 'canceled', 'paused')),

  -- Dates
  date_debut              TIMESTAMPTZ,
  date_fin                TIMESTAMPTZ,
  trial_ends_at           TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT abonnements_user_id_unique UNIQUE (user_id)
);

-- ============================================================
-- TRIGGERS : updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entreprises_updated_at
  BEFORE UPDATE ON entreprises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_postes_updated_at
  BEFORE UPDATE ON postes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_operations_updated_at
  BEFORE UPDATE ON operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_preselections_updated_at
  BEFORE UPDATE ON preselections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_plans_maitrise_updated_at
  BEFORE UPDATE ON plans_maitrise
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_abonnements_updated_at
  BEFORE UPDATE ON abonnements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX idx_postes_entreprise_id    ON postes(entreprise_id);
CREATE INDEX idx_operations_poste_id     ON operations(poste_id);
CREATE INDEX idx_preselections_operation ON preselections(operation_id);
CREATE INDEX idx_evaluations_operation   ON evaluations(operation_id);
CREATE INDEX idx_plans_maitrise_eval     ON plans_maitrise(evaluation_id);
CREATE INDEX idx_abonnements_user_id     ON abonnements(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Un utilisateur ne voit QUE les données de son entreprise
-- ============================================================

ALTER TABLE entreprises     ENABLE ROW LEVEL SECURITY;
ALTER TABLE postes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE preselections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans_maitrise   ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonnements      ENABLE ROW LEVEL SECURITY;

-- entreprises : l'utilisateur ne voit que son entreprise
CREATE POLICY "entreprises_own" ON entreprises
  FOR ALL USING (auth.uid() = user_id);

-- postes : via entreprise de l'utilisateur
CREATE POLICY "postes_own" ON postes
  FOR ALL USING (
    entreprise_id IN (
      SELECT id FROM entreprises WHERE user_id = auth.uid()
    )
  );

-- operations : via poste → entreprise de l'utilisateur
CREATE POLICY "operations_own" ON operations
  FOR ALL USING (
    poste_id IN (
      SELECT p.id FROM postes p
      JOIN entreprises e ON e.id = p.entreprise_id
      WHERE e.user_id = auth.uid()
    )
  );

-- preselections : via operation → poste → entreprise
CREATE POLICY "preselections_own" ON preselections
  FOR ALL USING (
    operation_id IN (
      SELECT o.id FROM operations o
      JOIN postes p ON p.id = o.poste_id
      JOIN entreprises e ON e.id = p.entreprise_id
      WHERE e.user_id = auth.uid()
    )
  );

-- evaluations : via operation → poste → entreprise
CREATE POLICY "evaluations_own" ON evaluations
  FOR ALL USING (
    operation_id IN (
      SELECT o.id FROM operations o
      JOIN postes p ON p.id = o.poste_id
      JOIN entreprises e ON e.id = p.entreprise_id
      WHERE e.user_id = auth.uid()
    )
  );

-- plans_maitrise : via evaluation → operation → poste → entreprise
CREATE POLICY "plans_maitrise_own" ON plans_maitrise
  FOR ALL USING (
    evaluation_id IN (
      SELECT ev.id FROM evaluations ev
      JOIN operations o ON o.id = ev.operation_id
      JOIN postes p ON p.id = o.poste_id
      JOIN entreprises e ON e.id = p.entreprise_id
      WHERE e.user_id = auth.uid()
    )
  );

-- abonnements : l'utilisateur ne voit que son abonnement
CREATE POLICY "abonnements_own" ON abonnements
  FOR ALL USING (auth.uid() = user_id);
