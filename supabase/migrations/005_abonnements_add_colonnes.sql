-- ============================================================
-- Migration 005 — Ajout colonnes manquantes sur abonnements
--
-- La table abonnements a été créée via la migration 001 (avant Phase 2A).
-- La migration 004 utilisait CREATE TABLE IF NOT EXISTS et a donc été ignorée
-- silencieusement car la table existait déjà.
-- Cette migration ajoute les colonnes manquantes de façon idempotente.
-- ============================================================

-- Colonnes Stripe manquantes (ajoutées en 004, jamais appliquées)
ALTER TABLE abonnements ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE abonnements ADD COLUMN IF NOT EXISTS periode          TEXT;  -- 'mensuel' | 'annuel' | NULL
ALTER TABLE abonnements ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Index sur stripe_subscription_id si absent (ajouté en 004)
CREATE INDEX IF NOT EXISTS idx_abonnements_stripe_sub
  ON abonnements(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
