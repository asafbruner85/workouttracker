# Workout Tracker

Personal fitness tracking PWA for managing strength training, CrossFit, and running workouts.

**Live App**: https://workouttracker-six.vercel.app
**Current Version**: v1.2.12
**Last Updated**: 2026-05-09

## IMPORTANT: Keep This File Updated

**After ANY code changes, update this file to reflect:**
- New files/components added → Update Project Structure
- Version bumps → Update Current Version
- New dependencies → Update Tech Stack
- New commands → Update Commands section
- Architecture changes → Update Architecture Notes
- Test count changes → Update Test Coverage

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (optional) + localStorage fallback
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:all     # Run all tests
npm run deploy       # Build and deploy to GitHub Pages
vercel --prod        # Deploy to Vercel production
```

## Project Structure

```
src/
├── WorkoutTracker.jsx           # Main app (~170 lines after refactor)
├── main.jsx                     # Entry point
├── index.css                    # Tailwind imports
├── storage.js                   # Hybrid storage (Supabase + localStorage)
├── supabaseClient.js            # Supabase configuration
├── components/
│   ├── ErrorBoundary.jsx        # Crash recovery UI (prevents blank screen)
│   ├── LoginScreen.jsx          # Password authentication
│   ├── ProgressDashboard.jsx    # Analytics with Recharts
│   ├── ScheduleConfig.jsx       # Weekly schedule editor
│   ├── LoadingSkeleton.jsx      # Loading state skeleton
│   ├── SkeletonComponents.jsx   # Reusable skeleton primitives
│   ├── UpdateNotification.jsx   # PWA update prompt
│   ├── calendar/
│   │   ├── CalendarGrid.jsx     # Calendar grid layout
│   │   ├── DayCard.jsx          # Individual day card
│   │   └── WorkoutPreview.jsx   # Exercise preview
│   ├── header/
│   │   ├── AppHeader.jsx        # Top bar with buttons
│   │   ├── NavigationButtons.jsx # Week/month navigation
│   │   └── ViewModeSwitcher.jsx # Daily/weekly/monthly toggle
│   ├── history/
│   │   └── HistoryPanel.jsx     # Workout history sidebar
│   ├── modals/
│   │   ├── LogModal.jsx         # Log workout modal (~600 lines)
│   │   ├── EditWorkoutModal.jsx # Edit workout modal
│   │   └── ModalContainer.jsx   # Shared modal wrapper
│   └── stats/
│       └── QuickStats.jsx       # Weekly stats bar
├── constants/
│   ├── dates.js                 # Day names (Hebrew/English)
│   └── workoutTypes.js          # Workout configs, colors, icons
├── hooks/
│   ├── useAuthentication.js     # Auth state management
│   ├── useCalendarNavigation.js # View mode, week navigation
│   ├── useModalState.js         # Modal visibility states
│   └── useWorkoutData.js        # Programs, logs, schedules
└── utils/
    ├── analytics.js             # Stats calculations
    ├── auth.js                  # Password hashing (SHA-256)
    ├── dateUtils.js             # Date formatting utilities
    ├── pwa.js                   # Service worker registration
    └── workoutUtils.js          # Workout helper functions

public/
├── service-worker.js            # PWA caching
└── manifest.json                # PWA manifest

tests/
├── setup.js                     # Test setup and mocks
├── *.test.js                    # Vitest unit tests
├── hooks/*.test.js              # Hook tests
├── components/*.test.jsx        # Component tests
└── *.spec.js                    # Playwright E2E tests

docs/
└── SUPABASE_SETUP.md            # Cloud sync setup guide
```

## Key Patterns

### Version Management

When deploying changes, update `APP_VERSION` in BOTH files:
- `src/WorkoutTracker.jsx` (line ~27)
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

### Custom Hooks

- **useAuthentication** - Login/logout, auth state, loading
- **useCalendarNavigation** - currentWeek, viewMode, navigation
- **useModalState** - All modal visibility states
- **useWorkoutData** - Programs, logs, schedules, CRUD operations

## Environment Variables

```bash
VITE_SUPABASE_URL=        # Optional: Supabase project URL
VITE_SUPABASE_ANON_KEY=   # Optional: Supabase anon key
VITE_PASSWORD_HASH=       # Optional: Custom SHA-256 password hash
```

Default password: `asaf2024`

## Testing

### Test Coverage

- **288 tests** total (33% code coverage)
- Unit tests: utilities, hooks, components
- E2E tests: critical flows, input focus, production

### Running Tests

```bash
npm run test              # Unit tests (watch mode)
npm run test -- --run     # Unit tests (single run)
npm run test:coverage     # With coverage report
npm run test:e2e          # E2E tests (requires dev server)
```

## Deployment

### Vercel (Primary)

This project is configured for Vercel with `vercel.json`:
- **SPA Rewrites**: All routes redirect to `index.html`
- **Asset Caching**: Static assets cached for 1 year (immutable)
- **Service Worker**: No caching to ensure updates propagate
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

```bash
vercel              # Preview deployment
vercel --prod       # Production deployment
```

### GitHub Pages (Alternative)

```bash
npm run deploy      # Build and deploy to gh-pages
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

## Architecture Notes

### Major Refactor (v1.2.0)

WorkoutTracker.jsx was refactored from 1,847 lines to ~170 lines by:
- Extracting modals to `components/modals/`
- Extracting calendar to `components/calendar/`
- Extracting header to `components/header/`
- Creating custom hooks in `hooks/`
- Creating shared constants in `constants/`
- Creating utilities in `utils/`

### Component Organization

- **Modals**: Self-contained with their own state management
- **Calendar**: Pure presentation components, data from props
- **Header**: Actions passed as callbacks
- **Hooks**: All business logic and state management

### Modal State Pattern

Modals receive computed props from parent (e.g., `workout` computed from `editDate`). Initialize local state as `null` and sync via `useEffect`:

```javascript
// CORRECT - handles prop timing
const [localWorkout, setLocalWorkout] = useState(null);

useEffect(() => {
  if (isOpen && workout) {
    setLocalWorkout(workout);
  }
}, [isOpen, workout]);

if (!isOpen || !workout || !localWorkout) return null;
```
