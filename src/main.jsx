import React from 'react'
import ReactDOM from 'react-dom/client'
import WorkoutTracker from './WorkoutTracker'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './storage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WorkoutTracker />
    </ErrorBoundary>
  </React.StrictMode>,
)
