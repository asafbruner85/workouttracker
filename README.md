# Workout Tracker

A personal workout tracking PWA for managing strength training, CrossFit, and running workouts.

**Live App**: https://workouttracker-six.vercel.app

## Features

- Weekly, monthly, and daily calendar views
- Track strength training exercises with weights, reps, and sets
- Log running workouts (sprints and long runs)
- Record CrossFit WOD sessions
- Progress dashboard with charts and statistics
- Personal records (PR) tracking
- Workout history with detailed logs
- Edit workout program per day or week
- Password-protected access
- PWA - installable on mobile devices
- Works offline with automatic sync
- Cloud backup with Supabase (optional)

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Recharts (analytics)
- Lucide React Icons
- Supabase (optional cloud sync)
- Vitest + Playwright (testing)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
git clone https://github.com/asafbruner/WorkoutTracker.git
cd workouttracker
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Default password: `asaf2024`

## Building for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### GitHub Pages

```bash
npm run deploy
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
VITE_SUPABASE_URL=        # Optional: Supabase project URL
VITE_SUPABASE_ANON_KEY=   # Optional: Supabase anon key
VITE_PASSWORD_HASH=       # Optional: Custom SHA-256 password hash
```

### Cloud Sync Setup

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for Supabase configuration.

## Usage

1. **Login**: Enter the password to access the app
2. **View Schedule**: See your workout plan in daily, weekly, or monthly view
3. **Log Workouts**: Click "Log Workout" to record your session
4. **Edit Workouts**: Click "Edit Workout" to customize exercises
5. **Track Progress**: Click "Progress" to view analytics and PRs
6. **Navigate**: Use arrows to view past or future weeks
7. **History**: Click history icon to see all logged workouts

## Testing

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report
```

## License

This project is private and for personal use.
