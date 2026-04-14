-- ============================================================
-- Migration 002 — Table de versioning du DUERP
-- Conformité Loi du 2 août 2021 (conservation 40 ans, horodatage)
-- ============================================================

CREATE TABLE IF NOT EXISTS versions_duerp (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entreprise_id    UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  numero_version   INTEGER NOT NULL DEFAULT 1,
  date_generation  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by     UUID NOT NULL REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_versions_duerp_entreprise ON versions_duerp(entreprise_id);

ALTER TABLE versions_duerp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "versions_duerp_own" ON versions_duerp
  FOR ALL USING (
    entreprise_id IN (
      SELECT id FROM entreprises WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER trg_versions_duerp_updated_at
  BEFORE UPDATE ON versions_duerp
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
