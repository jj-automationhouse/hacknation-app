/*
  # Hierarchiczny system limitów budżetowych

  ## Wprowadzenie
  Przebudowa systemu limitów z pojedynczych pozycji budżetowych na hierarchiczny system
  jednostek organizacyjnych.

  ## 1. Nowa tabela
    - `unit_limits`
      - `id` (uuid, primary key)
      - `unit_id` (uuid) - jednostka która otrzymała limit
      - `assigned_by_unit_id` (uuid) - jednostka która przydzieliła limit
      - `total_requested` (numeric) - suma wniosków z danej jednostki
      - `limit_assigned` (numeric) - przydzielony limit
      - `status` (text) - pending, assigned, distributed
      - `fiscal_year` (integer) - rok budżetowy
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ## 2. Zmiany w istniejących tabelach
    - Usunięcie pól `limit_amount` i `limit_status` z `budget_items` (opcjonalne dla kompatybilności)

  ## 3. Bezpieczeństwo
    - Włączenie RLS dla tabeli `unit_limits`
    - Polityki dostępu dla anonymous użytkowników

  ## Logika działania
  1. Jednostka najwyższa (województwo) widzi sumę wniosków z każdej jednostki podległej (powiatów)
  2. Przydziela limit dla całego powiatu
  3. Powiat widzi swój przydzielony limit i sumę wniosków z podległych gmin
  4. Powiat przydziela limity gminom
  5. I tak dalej w dół hierarchii
*/

CREATE TABLE IF NOT EXISTS unit_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  assigned_by_unit_id uuid NOT NULL REFERENCES organizational_units(id) ON DELETE CASCADE,
  total_requested numeric(12, 2) NOT NULL DEFAULT 0,
  limit_assigned numeric(12, 2),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'distributed')),
  fiscal_year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unit_limits_unique_unit_year UNIQUE (unit_id, assigned_by_unit_id, fiscal_year)
);

ALTER TABLE unit_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to unit_limits"
  ON unit_limits FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to unit_limits"
  ON unit_limits FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to unit_limits"
  ON unit_limits FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to unit_limits"
  ON unit_limits FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_unit_limits_unit_id ON unit_limits(unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_limits_assigned_by ON unit_limits(assigned_by_unit_id);
CREATE INDEX IF NOT EXISTS idx_unit_limits_fiscal_year ON unit_limits(fiscal_year);

CREATE OR REPLACE FUNCTION update_unit_limits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_unit_limits_timestamp_trigger'
  ) THEN
    CREATE TRIGGER update_unit_limits_timestamp_trigger
      BEFORE UPDATE ON unit_limits
      FOR EACH ROW
      EXECUTE FUNCTION update_unit_limits_timestamp();
  END IF;
END $$;
