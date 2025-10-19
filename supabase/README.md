# Supabase Setup Instructions

## Initial Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Copy your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

3. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL in the SQL Editor

This will:
- Create the `locations` and `survey_responses` tables
- Set up Row Level Security (RLS) policies
- Seed the database with 10 parking locations
- Create indexes for performance
- Create an analytics view

## Verify Setup

After running the schema, verify:
- Tables exist in the Table Editor
- 10 locations are present in the `locations` table
- RLS policies are enabled and configured

## Admin User Setup

To access the admin dashboard, you need to create an admin user:

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add User"
3. Create an admin account with email and password
4. Use these credentials to log into `/admin/login`

## QR Code Generation

After deployment, you can generate QR codes for each location:
- Use the URL format: `https://yourdomain.com/survey/{location-slug}`
- Example: `https://yourdomain.com/survey/atl-select`
