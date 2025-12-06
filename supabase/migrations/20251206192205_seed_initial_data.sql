/*
  # Seed Initial Data for Budget Management System

  ## Overview
  This migration populates the database with initial test data for the budget management system.

  ## Data Added

  ### Organizational Units
  - 1 Voivodeship (Województwo Mazowieckie)
  - 2 Counties (Powiat Warszawski, Powiat Radomski)
  - 3 Municipalities (Gmina Pruszków, Gmina Piaseczno, Gmina Radom)
  - 4 Institutions (Schools, Hospital, Municipal Office)

  ### Users
  - 4 basic users (one per institution)
  - 3 approvers (one per municipality)
  - 2 approvers (one per county)
  - 1 admin (voivodeship level)

  ### Budget Items
  - 5 initial budget items in draft status
  - Various categories: Equipment, Renovations, Medical Equipment, Software

  ## Important Notes
  - All IDs are predefined UUIDs for consistency
  - Users are linked to auth.users (must be created separately)
  - Budget items start in draft status
  - No submissions or comments are created initially
*/

-- Insert organizational units
INSERT INTO organizational_units (id, name, type, parent_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Województwo Mazowieckie', 'voivodeship', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Powiat Warszawski', 'county', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Powiat Radomski', 'county', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', 'Gmina Pruszków', 'municipality', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000005', 'Gmina Piaseczno', 'municipality', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000006', 'Gmina Radom', 'municipality', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000007', 'Szkoła Podstawowa nr 5', 'institution', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000008', 'Szpital Powiatowy', 'institution', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000009', 'Urząd Gminy Piaseczno', 'institution', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-00000000000a', 'Szkoła Podstawowa nr 12', 'institution', '00000000-0000-0000-0000-000000000006')
ON CONFLICT (id) DO NOTHING;

-- Note: Users will need to be created in auth.users first before inserting into public.users
-- For now, we'll insert placeholder users (these will need actual auth.users IDs)
-- This is commented out as it requires auth.users to exist first
-- INSERT INTO users (id, name, email, role, unit_id) VALUES
--   ('10000000-0000-0000-0000-000000000001', 'Jan Kowalski', 'jan.kowalski@example.com', 'basic', '00000000-0000-0000-0000-000000000007'),
--   ('10000000-0000-0000-0000-000000000002', 'Anna Nowak', 'anna.nowak@example.com', 'basic', '00000000-0000-0000-0000-000000000008'),
--   ('10000000-0000-0000-0000-000000000003', 'Piotr Wiśniewski', 'piotr.wisniewski@example.com', 'basic', '00000000-0000-0000-0000-000000000009'),
--   ('10000000-0000-0000-0000-000000000004', 'Maria Wójcik', 'maria.wojcik@example.com', 'basic', '00000000-0000-0000-0000-00000000000a'),
--   ('10000000-0000-0000-0000-000000000005', 'Krzysztof Kamiński', 'krzysztof.kaminski@example.com', 'approver', '00000000-0000-0000-0000-000000000004'),
--   ('10000000-0000-0000-0000-000000000006', 'Ewa Lewandowska', 'ewa.lewandowska@example.com', 'approver', '00000000-0000-0000-0000-000000000005'),
--   ('10000000-0000-0000-0000-000000000007', 'Tomasz Zieliński', 'tomasz.zielinski@example.com', 'approver', '00000000-0000-0000-0000-000000000006'),
--   ('10000000-0000-0000-0000-000000000008', 'Katarzyna Szymańska', 'katarzyna.szymanska@example.com', 'approver', '00000000-0000-0000-0000-000000000002'),
--   ('10000000-0000-0000-0000-000000000009', 'Marek Woźniak', 'marek.wozniak@example.com', 'approver', '00000000-0000-0000-0000-000000000003'),
--   ('10000000-0000-0000-0000-00000000000a', 'Agnieszka Dąbrowska', 'agnieszka.dabrowska@example.com', 'admin', '00000000-0000-0000-0000-000000000001')
-- ON CONFLICT (id) DO NOTHING;

-- Insert initial budget items (without user dependencies)
INSERT INTO budget_items (id, unit_id, category, description, year, amount, status, clarification_status) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'Wyposażenie', 'Komputery dla pracowni informatycznej', 2024, 50000, 'draft', 'none'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'Remonty', 'Remont sali gimnastycznej', 2024, 120000, 'draft', 'none'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'Sprzęt medyczny', 'Zakup aparatu USG', 2024, 200000, 'draft', 'none'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'Oprogramowanie', 'Licencje na system obiegu dokumentów', 2024, 30000, 'draft', 'none'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-00000000000a', 'Wyposażenie', 'Meble do klas', 2024, 45000, 'draft', 'none')
ON CONFLICT (id) DO NOTHING;