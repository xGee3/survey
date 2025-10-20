-- Migration: Add settings table for universal app configuration
-- Run this in your Supabase SQL Editor
-- This allows QR code base URL and other settings to be saved across all devices

-- Create settings table for app-wide configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

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
