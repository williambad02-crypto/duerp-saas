-- ============================================================
-- Migration 004 — Table des abonnements
-- Gestion du cycle de vie Stripe + trial maison
-- ============================================================

CREATE TABLE IF NOT EXISTS abonnements (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id        TEXT,
  plan                   TEXT NOT NULL DEFAULT 'essentiel',   -- 'essentiel' | 'consulting'
  periode                TEXT,                                 -- 'mensuel' | 'annuel' | NULL (trial)
  statut                 TEXT NOT NULL DEFAULT 'trial',        -- 'trial' | 'active' | 'past_due' | 'canceled'
  trial_ends_at          TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT abonnements_user_unique UNIQUE (user_id)
);

CREATE INDEX idx_abonnements_user ON abonnements(user_id);
CREATE INDEX idx_abonnements_stripe_sub ON abonnements(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- L'utilisateur peut lire son propre abonnement
CREATE POLICY "abonnements_select_own" ON abonnements
  FOR SELECT USING (user_id = auth.uid());

-- L'utilisateur peut insérer son propre abonnement (création trial à l'onboarding)
CREATE POLICY "abonnements_insert_own" ON abonnements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update via service_role uniquement (webhook Stripe)
-- Pas de policy UPDATE pour anon/authenticated — seul le service_role peut updater

CREATE TRIGGER trg_abonnements_updated_at
  BEFORE UPDATE ON abonnements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
