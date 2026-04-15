-- ============================================================
-- Migration 008 — Ajout plan_type et legacy_plan sur abonnements
-- Bascule Stratégie C : Pack Industrie (99€) / Pack Premium (149€)
-- ============================================================

-- Colonne plan_type : identifie le plan souscrit
--   'industrie' = Pack Industrie (5 postes max / 20 opérations max)
--   'premium'   = Pack Premium (illimité)
-- Défaut 'industrie' pour les nouveaux comptes et les trials existants.
ALTER TABLE abonnements ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'industrie';

-- Colonne legacy_plan : flag pour les clients sur l'ancien plan 39€
-- Permet le grandfathering (ils gardent leurs droits sans migration forcée).
ALTER TABLE abonnements ADD COLUMN IF NOT EXISTS legacy_plan BOOLEAN NOT NULL DEFAULT FALSE;

-- Marquer tous les clients déjà abonnés (stripe_subscription_id présent)
-- comme legacy — ils étaient sur l'ancien plan unique à 39€.
-- Les clients legacy ont un accès équivalent Premium (illimité) tant qu'ils restent abonnés.
UPDATE abonnements
SET    legacy_plan = TRUE,
       plan_type   = 'premium'   -- ancien plan = tout illimité, on assimile Premium
WHERE  stripe_subscription_id IS NOT NULL
  AND  legacy_plan = FALSE;

-- Index pour filtres fréquents
CREATE INDEX IF NOT EXISTS idx_abonnements_plan_type ON abonnements(plan_type);
