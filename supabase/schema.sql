-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  traveler_type TEXT NOT NULL CHECK (traveler_type IN ('leisure', 'business')),
  parking_preference TEXT NOT NULL CHECK (parking_preference IN ('self_park', 'shuttle_service')),
  usage_frequency TEXT NOT NULL CHECK (usage_frequency IN ('5_or_fewer', 'more_than_5')),
  exit_method TEXT NOT NULL CHECK (exit_method IN ('automated', 'cashier', 'pay_on_foot')),
  exit_time TEXT NOT NULL CHECK (exit_time IN ('1_4_minutes', '5_9_minutes', '10_plus_minutes')),
  cashier_efficient BOOLEAN,
  cleanliness_surface INTEGER NOT NULL CHECK (cleanliness_surface >= 1 AND cleanliness_surface <= 4),
  cleanliness_stairs INTEGER NOT NULL CHECK (cleanliness_stairs >= 1 AND cleanliness_stairs <= 4),
  cleanliness_elevators INTEGER NOT NULL CHECK (cleanliness_elevators >= 1 AND cleanliness_elevators <= 4),
  overall_experience INTEGER NOT NULL CHECK (overall_experience >= 1 AND overall_experience <= 4),
  comments TEXT,
  first_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for app-wide configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_location_id ON public.survey_responses(location_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug);
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
-- Allow public read access to locations
CREATE POLICY "Allow public read access to locations"
  ON public.locations
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users (admins) full access to locations
CREATE POLICY "Allow authenticated full access to locations"
  ON public.locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for survey_responses
-- Allow public insert access (for survey submissions)
CREATE POLICY "Allow public insert access to survey responses"
  ON public.survey_responses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admins) full access to survey responses
CREATE POLICY "Allow authenticated full access to survey responses"
  ON public.survey_responses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for settings
-- Allow authenticated users (admins) to read settings
CREATE POLICY "Allow authenticated read access to settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update settings
CREATE POLICY "Allow authenticated update access to settings"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to insert settings
CREATE POLICY "Allow authenticated insert access to settings"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert seed data for app settings
INSERT INTO public.settings (key, value, description) VALUES
  ('qr_base_url', 'http://localhost:3000', 'Base URL for QR code generation')
ON CONFLICT (key) DO NOTHING;

-- Insert seed data for parking locations
INSERT INTO public.locations (name, slug) VALUES
  ('ATL Select', 'atl-select'),
  ('ATL West', 'atl-west'),
  ('International Hourly', 'international-hourly'),
  ('International Park-Ride', 'international-park-ride'),
  ('North Daily', 'north-daily'),
  ('North Economy', 'north-economy'),
  ('North Hourly', 'north-hourly'),
  ('Park-Ride', 'park-ride'),
  ('South Daily', 'south-daily'),
  ('South Hourly', 'south-hourly')
ON CONFLICT (slug) DO NOTHING;

-- Create a view for analytics (optional, but useful)
CREATE OR REPLACE VIEW public.survey_analytics AS
SELECT
  l.name as location_name,
  l.slug as location_slug,
  COUNT(sr.id) as total_responses,
  AVG(sr.overall_experience) as avg_overall_experience,
  AVG(sr.cleanliness_surface) as avg_cleanliness_surface,
  AVG(sr.cleanliness_stairs) as avg_cleanliness_stairs,
  AVG(sr.cleanliness_elevators) as avg_cleanliness_elevators,
  COUNT(CASE WHEN sr.traveler_type = 'leisure' THEN 1 END) as leisure_travelers,
  COUNT(CASE WHEN sr.traveler_type = 'business' THEN 1 END) as business_travelers,
  COUNT(CASE WHEN sr.parking_preference = 'self_park' THEN 1 END) as self_park_count,
  COUNT(CASE WHEN sr.parking_preference = 'shuttle_service' THEN 1 END) as shuttle_service_count
FROM public.locations l
LEFT JOIN public.survey_responses sr ON l.id = sr.location_id
GROUP BY l.id, l.name, l.slug;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.survey_analytics TO authenticated;
