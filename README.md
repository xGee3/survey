# Parking Customer Survey Web App

A mobile-friendly web application for collecting customer feedback about parking facilities. Built with Next.js 14, React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Mobile-First Survey Flow**: 10-step survey optimized for mobile devices
- **QR Code Access**: Customers scan location-specific QR codes to access surveys
- **Progress Persistence**: Automatically saves survey progress to localStorage
- **Admin Dashboard**: View analytics, export data, and manage locations
- **Responsive Design**: Red and white color scheme with touch-friendly controls
- **PWA Support**: Progressive Web App capabilities for offline access
- **Secure Authentication**: Supabase Auth for admin users
- **Data Export**: Export survey responses to CSV
- **Analytics**: Real-time dashboard with response trends

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, API)
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Git

## Quick Start

### 1. Clone and Install

```bash
cd Survey_Customer
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Create `.env.local` file:

```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

1. Go to Supabase SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and execute in SQL Editor

This creates:
- `locations` table with 10 parking locations
- `survey_responses` table for storing submissions
- Row Level Security policies
- Analytics view

### 4. Create Admin User

1. Go to Authentication > Users in Supabase
2. Click "Add User"
3. Create account with email/password
4. Use these credentials to log into `/admin/login`

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Project Structure

```
Survey_Customer/
├── app/
│   ├── admin/
│   │   ├── dashboard/         # Analytics dashboard
│   │   ├── responses/         # View and export responses
│   │   ├── locations/         # Manage locations and QR codes
│   │   └── login/             # Admin authentication
│   ├── survey/
│   │   └── [locationSlug]/    # Dynamic survey form
│   ├── api/
│   │   ├── locations/         # Location API endpoints
│   │   └── survey/            # Survey submission endpoint
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── admin/                 # Admin components
│   └── survey/                # Survey form components
├── lib/
│   ├── supabase/              # Supabase client utilities
│   └── validation.ts          # Zod schemas
├── types/
│   └── index.ts               # TypeScript types
├── public/
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO configuration
└── supabase/
    ├── schema.sql             # Database schema
    └── README.md              # Supabase setup guide
```

## Parking Locations

The app comes pre-seeded with these locations:

1. ATL Select (`/survey/atl-select`)
2. ATL West (`/survey/atl-west`)
3. International Hourly (`/survey/international-hourly`)
4. International Park-Ride (`/survey/international-park-ride`)
5. North Daily (`/survey/north-daily`)
6. North Economy (`/survey/north-economy`)
7. North Hourly (`/survey/north-hourly`)
8. Park-Ride (`/survey/park-ride`)
9. South Daily (`/survey/south-daily`)
10. South Hourly (`/survey/south-hourly`)

## Survey Questions

1. Traveler type (Leisure/Business)
2. Parking preference (Self Park/Shuttle Service)
3. Usage frequency (5 or fewer/More than 5 per year)
4. Exit method (Automated/Cashier/Pay-on-Foot)
5. Exit time (1-4 min/5-9 min/10+ min)
6. Cashier rating (Yes/No, conditional)
7. Cleanliness ratings (1-4 scale):
   - Surface area/Walkways
   - Stairwells
   - Elevators
8. Overall experience (1-4 scale)
9. Comments (optional)
10. Contact info (name, phone, email)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy!

### Update Supabase for Production

1. Create a production Supabase project
2. Run the schema SQL in production
3. Update Vercel environment variables with production credentials
4. Redeploy

### Generate QR Codes

1. Log into admin dashboard at `/admin/locations`
2. Click "Download QR" for each location
3. Print and place QR codes at respective parking locations

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Technologies

- **Next.js App Router**: Modern React framework with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hook Form**: Performant form handling
- **Zod**: Runtime type validation
- **Supabase**: Backend as a service
- **@supabase/ssr**: Server-side auth for Next.js

## Features Explained

### Mobile-First Design

- Large touch targets (min 48px)
- Readable text sizes (16px+)
- Optimized for portrait orientation
- Smooth scrolling and transitions

### Data Persistence

- Survey progress auto-saved to localStorage
- Prevents data loss on page refresh
- Clears after successful submission

### Security

- Row Level Security (RLS) on all tables
- Public can only insert survey responses
- Authenticated users (admins) have full access
- Environment variables for sensitive data

### Analytics

- Real-time response counts
- Average ratings across locations
- Location-specific breakdowns
- Traveler type distribution

## Admin Features

### Dashboard (`/admin/dashboard`)

- Total responses
- 7-day response count
- Average overall rating
- Average cleanliness rating
- Top locations by responses

### Responses (`/admin/responses`)

- View all survey responses
- Filter by location
- Export to CSV
- View individual response details

### Locations (`/admin/locations`)

- View all parking locations
- Copy survey URLs
- Download QR codes
- Track location slugs

## Customization

### Colors

Edit `tailwind.config.ts` to change the red theme:

```typescript
colors: {
  primary: {
    // Your custom color scale
  }
}
```

### Adding Questions

1. Update `types/index.ts` with new fields
2. Add to `lib/validation.ts` schema
3. Update survey form in `app/survey/[locationSlug]/page.tsx`
4. Modify database schema in `supabase/schema.sql`
5. Update API in `app/api/survey/submit/route.ts`

## Troubleshooting

### Build Errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Supabase Connection Issues

- Verify `.env.local` credentials
- Check Supabase project status
- Ensure RLS policies are configured

### Authentication Not Working

- Verify admin user exists in Supabase
- Check Supabase Auth settings
- Clear browser cookies and try again

## Support

For issues or questions:

1. Check the documentation in `/supabase/README.md`
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Verify environment variables

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [TypeScript](https://www.typescriptlang.org/)
