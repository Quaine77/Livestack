-- Run this entire file in Supabase SQL Editor

create table animals (
  id           uuid default gen_random_uuid() primary key,
  tag_id       text unique not null,
  name         text,
  species      text,
  breed        text,
  weight_kg    numeric,
  status       text default 'active',
  lat          numeric,
  lng          numeric,
  rada_licence text,
  created_at   timestamptz default now()
);

create table theft_reports (
  id          uuid default gen_random_uuid() primary key,
  animal_id   uuid references animals(id),
  tag_id      text,
  description text,
  police_case text,
  created_at  timestamptz default now()
);

create table health_alerts (
  id          uuid default gen_random_uuid() primary key,
  animal_id   uuid references animals(id),
  alert_type  text,
  severity    text,
  message     text,
  resolved    boolean default false,
  created_at  timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table animals;

-- Seed demo animals
insert into animals (tag_id, name, species, breed, weight_kg, status, lat, lng, rada_licence) values
  ('JM-001', 'Big Boy', 'Cattle', 'Black Angus',  480, 'active',   17.9970, -76.7936, 'RADA-2024-001'),
  ('JM-002', 'Bessie',  'Cattle', 'Holstein',     560, 'active',   17.9985, -76.7920, 'RADA-2024-002'),
  ('JM-003', 'Nanny',   'Goat',   'Boer',          42, 'alert',    17.9960, -76.7950, 'RADA-2024-003'),
  ('JM-004', 'Rambo',   'Sheep',  'Dorper',        95, 'active',   17.9975, -76.7910, 'RADA-2024-004'),
  ('JM-005', 'Duchess', 'Cattle', 'Brahman',      310, 'blocked',  17.9955, -76.7965, 'RADA-2024-005'),
  ('JM-006', 'Junior',  'Cattle', 'Red Poll',     120, 'active',   17.9990, -76.7900, 'RADA-2024-006'),
  ('JM-007', 'Pepper',  'Goat',   'Nubian',        38, 'active',   17.9945, -76.7940, 'RADA-2024-007'),
  ('JM-008', 'Scout',   'Cattle', 'Charolais',    420, 'for_sale', 17.9980, -76.7925, 'RADA-2024-008');
