-- ============================================================
-- Migration 007 — Interface tableau inline éditable
--
-- 1. Colonne `ordre` sur evaluations (tri drag-and-drop)
-- 2. Trigger : création auto de "Toutes opérations" à la création d'un poste
-- 3. Backfill : ajouter "Toutes opérations" aux postes existants
-- ============================================================

-- ── Colonne ordre ────────────────────────────────────────────────────────────

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS ordre INTEGER DEFAULT 0;

-- ── Trigger "Toutes opérations" ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION ensure_toutes_operations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO operations (poste_id, nom, est_transversale, ordre)
  VALUES (NEW.id, 'Toutes opérations', true, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_poste_insert ON postes;
CREATE TRIGGER on_poste_insert
  AFTER INSERT ON postes
  FOR EACH ROW EXECUTE FUNCTION ensure_toutes_operations();

-- ── Backfill : postes existants sans "Toutes opérations" ────────────────────

INSERT INTO operations (poste_id, nom, est_transversale, ordre)
SELECT p.id, 'Toutes opérations', true, 0
FROM postes p
WHERE NOT EXISTS (
  SELECT 1 FROM operations o
  WHERE o.poste_id = p.id AND o.est_transversale = true
);
