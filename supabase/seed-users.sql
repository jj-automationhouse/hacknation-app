-- =====================================================
-- Seed Users Script
-- =====================================================
-- This script adds test users to the database.
--
-- IMPORTANT: Before running this script, you need to create users in Supabase Auth:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Add users manually, or use the Auth API
-- 3. Copy the user IDs and replace the placeholders below
--
-- Alternatively, you can use this SQL to insert mock users directly
-- into the auth.users table (for development only):
-- =====================================================

-- Option 1: If you have auth user IDs, replace the UUIDs below
-- INSERT INTO public.users (id, name, email, role, unit_id) VALUES
--   ('YOUR-AUTH-USER-ID-1', 'Jan Kowalski', 'jan.kowalski@example.com', 'basic', '00000000-0000-0000-0000-000000000007'),
--   ('YOUR-AUTH-USER-ID-2', 'Anna Nowak', 'anna.nowak@example.com', 'basic', '00000000-0000-0000-0000-000000000008'),
--   etc...

-- Option 2: Create mock auth users for development (DEVELOPMENT ONLY!)
-- WARNING: This bypasses Supabase Auth and should only be used for local development

-- First, create auth users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'jan.kowalski@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'anna.nowak@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'piotr.wisniewski@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'maria.wojcik@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'krzysztof.kaminski@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'ewa.lewandowska@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'tomasz.zielinski@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'katarzyna.szymanska@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'marek.wozniak@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '10000000-0000-0000-0000-00000000000a',
    '00000000-0000-0000-0000-000000000000',
    'agnieszka.dabrowska@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Then insert corresponding public.users records
INSERT INTO public.users (id, name, email, role, unit_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Jan Kowalski', 'jan.kowalski@example.com', 'basic', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000002', 'Anna Nowak', 'anna.nowak@example.com', 'basic', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000003', 'Piotr Wiśniewski', 'piotr.wisniewski@example.com', 'basic', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000004', 'Maria Wójcik', 'maria.wojcik@example.com', 'basic', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000005', 'Krzysztof Kamiński', 'krzysztof.kaminski@example.com', 'approver', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000006', 'Ewa Lewandowska', 'ewa.lewandowska@example.com', 'approver', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000007', 'Tomasz Zieliński', 'tomasz.zielinski@example.com', 'approver', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000008', 'Katarzyna Szymańska', 'katarzyna.szymanska@example.com', 'approver', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000009', 'Marek Woźniak', 'marek.wozniak@example.com', 'approver', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-00000000000a', 'Agnieszka Dąbrowska', 'agnieszka.dabrowska@example.com', 'admin', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
