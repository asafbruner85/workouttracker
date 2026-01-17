# Workout Tracker

Personal fitness tracking PWA for managing strength training, CrossFit, and running workouts.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (optional) + localStorage fallback
- **Testing**: Vitest (unit) + Playwright (E2E)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:all     # Run all tests
npm run deploy       # Build and deploy to GitHub Pages
```

## Project Structure

```
src/
├── WorkoutTracker.jsx      # Main app component (large, contains inline modals)
├── main.jsx                # Entry point
├── index.css               # Tailwind imports
├── storage.js              # Hybrid storage layer (Supabase + localStorage)
├── supabaseClient.js       # Supabase configuration
├── components/
│   ├── LoginScreen.jsx     # Password authentication
│   ├── ProgressDashboard.jsx # Analytics with Recharts
│   ├── ScheduleConfig.jsx  # Weekly schedule editor
│   ├── LoadingSkeleton.jsx # Loading state skeleton
│   ├── SkeletonComponents.jsx # Reusable skeleton primitives
│   └── UpdateNotification.jsx # PWA update prompt
└── utils/
    ├── analytics.js        # Stats calculations
    ├── auth.js             # Password hashing (SHA-256)
    └── pwa.js              # Service worker registration

public/
├── service-worker.js       # PWA caching
└── manifest.json           # PWA manifest

tests/
├── *.test.js               # Vitest unit tests
└── *.spec.js               # Playwright E2E tests
```

## Key Patterns

### Version Management
When deploying changes, update `APP_VERSION` in BOTH files:
- `src/WorkoutTracker.jsx` (line ~13)
- `public/service-worker.js` (line ~4)

This triggers cache busting for PWA users.

### Storage Layer
`storage.js` provides a hybrid storage abstraction:
- Tries Supabase if configured
- Falls back to localStorage
- All data operations go through `window.storage`

### Data Keys
- `workout_logs` - Logged workouts by date (e.g., "2025-01-17")
- `workout_program` - Default weekly schedule (index 0-6 = Sun-Sat)
- `weekly_schedules` - Per-week overrides keyed by week start date
- `auth_state` - Authentication status

### Form Input Pattern
Log modal uses `useRef` for form data to avoid re-renders during typing. State updates on modal close.

## Environment Variables

```bash
VITE_SUPABASE_URL=        # Optional: Supabase project URL
VITE_SUPABASE_ANON_KEY=   # Optional: Supabase anon key
VITE_PASSWORD_HASH=       # Optional: Custom SHA-256 password hash
```

Default password: `asaf2024`

## Testing Notes

- Unit tests in `tests/*.test.js` use Vitest + Testing Library
- E2E tests in `tests/*.spec.js` use Playwright
- Run `npm run test` before committing
- E2E tests require `npm run dev` or test against built app

## Vercel Deployment

This project is configured for Vercel with `vercel.json`:
- **SPA Rewrites**: All routes redirect to `index.html` for client-side routing
- **Asset Caching**: Static assets cached for 1 year (immutable)
- **Service Worker**: No caching to ensure updates propagate
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

### Deploy Commands
```bash
vercel              # Preview deployment
vercel --prod       # Production deployment
```

## Skills

### /deploy-vercel

Deploy the app to Vercel production.

Steps:
1. Bump `APP_VERSION` in both `src/WorkoutTracker.jsx` and `public/service-worker.js`
2. Run `npm run test` to verify no regressions
3. Run `npm run build` to create production build
4. Run `vercel --prod` to deploy to production
5. Report the deployment URL when complete
