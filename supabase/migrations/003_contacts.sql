-- ============================================================
-- Migration 003 — Table de contact (formulaire public)
-- ============================================================

CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  lu          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pas de RLS : la table est en insert-only public (formulaire non authentifié)
-- L'accès en lecture est réservé au service_role (dashboard Supabase)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Permettre l'insertion anonyme (formulaire de contact public)
CREATE POLICY "contacts_insert_public" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Aucune lecture/update/delete autorisé via anon key (admin Supabase uniquement)
