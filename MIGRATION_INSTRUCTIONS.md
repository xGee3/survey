# Database Migration Instructions

## ⚠️ IMPORTANT: Run This Migration First!

If you're getting errors when trying to save the QR code base URL, you need to run this migration to create the `settings` table.

## Why This Is Needed

The QR code base URL is now stored in the **database** (not localStorage), so it works universally across all devices:
- Set it once on your computer ✅
- Automatically available on your phone ✅
- Same URL on all tablets ✅
- Persists until you change it ✅

## How to Run the Migration

### Option 1: Run the Migration File (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Open your project**
3. **Navigate to**: SQL Editor (in left sidebar)
4. **Copy the entire contents** of: `supabase/migration_settings.sql`
5. **Paste into SQL Editor**
6. **Click "Run"** (or press Ctrl/Cmd + Enter)
7. ✅ You should see "Success. No rows returned"

### Option 2: Re-run the Full Schema

Alternatively, you can re-run the complete schema (it's safe, has IF NOT EXISTS checks):

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Open your project**
3. **Navigate to**: SQL Editor
4. **Copy the entire contents** of: `supabase/schema.sql`
5. **Paste into SQL Editor**
6. **Click "Run"**
7. ✅ You should see "Success"

## After Running the Migration

1. **Refresh your admin panel** (Ctrl/Cmd + R)
2. **Go to Locations page**
3. **Click "Change"** next to QR Code Base URL
4. **Enter your production URL**: `https://parkatlsurvey.vercel.app`
5. **Click "Save"**
6. ✅ You should see: "URL saved successfully!"

## Verify It Works

1. **Open admin panel on your phone**
2. **Go to Locations page**
3. **Check the QR Code Base URL**
4. ✅ It should show the same URL you set on your computer!

## Troubleshooting

**Error: "relation 'settings' does not exist"**
- This means you haven't run the migration yet
- Follow the steps above to create the settings table

**Error: "Failed to save URL"**
- Check browser console for detailed error message
- Verify you're logged in as admin
- Make sure migration was successful

**Settings don't sync across devices**
- Clear browser cache and refresh
- Make sure you're logged in with the same admin account
- Verify the setting exists in Supabase: Table Editor → settings table

## Need Help?

If you're still having issues:
1. Check the browser console for error messages (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Verify the settings table exists (Dashboard → Table Editor → settings)
