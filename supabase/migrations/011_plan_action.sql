-- Migration 011 — Tables contacts_entreprise + actions_plan
-- À appliquer dans Supabase Dashboard → SQL Editor
-- Dépend de : migration 010 (evaluations_bruit)

-- ─── contacts_entreprise ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts_entreprise (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'autre'
                  CHECK (role IN ('dirigeant','chef_equipe','rrh','responsable_hse','autre')),
  rappels_actifs BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_entreprise_id
  ON contacts_entreprise(entreprise_id);

ALTER TABLE contacts_entreprise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts: user voit ses contacts"
  ON contacts_entreprise FOR ALL
  USING (
    entreprise_id IN (
      SELECT id FROM entreprises WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    entreprise_id IN (
      SELECT id FROM entreprises WHERE user_id = auth.uid()
    )
  );

CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON contacts_entreprise
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── actions_plan ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS actions_plan (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id        UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  contact_id           UUID REFERENCES contacts_entreprise(id) ON DELETE SET NULL,
  description          TEXT,
  type_prevention      TEXT CHECK (type_prevention IN ('technique','organisationnelle','formation_epi')),
  facilite             TEXT CHECK (facilite IN ('facile','moyen','complexe')),
  echeance             DATE,
  statut               TEXT NOT NULL DEFAULT 'a_faire'
                         CHECK (statut IN ('a_faire','en_cours','termine')),
  rappels_actifs       BOOLEAN NOT NULL DEFAULT true,
  coefficient_pm_cible NUMERIC(3,2) CHECK (coefficient_pm_cible IN (0.0,0.25,0.5,0.75,1.0)),
  criticite_cible      NUMERIC(4,1),
  commentaire          TEXT,
  date_realisation     DATE,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actions_plan_evaluation_id
  ON actions_plan(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_actions_plan_contact_id
  ON actions_plan(contact_id);

ALTER TABLE actions_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actions_plan: user voit ses actions"
  ON actions_plan FOR ALL
  USING (
    evaluation_id IN (
      SELECT e.id FROM evaluations e
      JOIN operations op ON op.id = e.operation_id
      JOIN postes p ON p.id = op.poste_id
      JOIN entreprises ent ON ent.id = p.entreprise_id
      WHERE ent.user_id = auth.uid()
    )
  )
  WITH CHECK (
    evaluation_id IN (
      SELECT e.id FROM evaluations e
      JOIN operations op ON op.id = e.operation_id
      JOIN postes p ON p.id = op.poste_id
      JOIN entreprises ent ON ent.id = p.entreprise_id
      WHERE ent.user_id = auth.uid()
    )
  );

-- Trigger updated_at
CREATE TRIGGER set_updated_at_actions_plan
  BEFORE UPDATE ON actions_plan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger auto date_realisation quand statut → 'termine'
CREATE OR REPLACE FUNCTION set_date_realisation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'termine' AND OLD.statut <> 'termine' AND NEW.date_realisation IS NULL THEN
    NEW.date_realisation := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_date_realisation
  BEFORE UPDATE ON actions_plan
  FOR EACH ROW EXECUTE FUNCTION set_date_realisation();
