import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SchoolEntry from './pages/SchoolEntry'
import StudentProfileSetup from './pages/StudentProfileSetup'
import ModuleListPage from './pages/ModuleListPage'
import ModulePage from './pages/ModulePage'
import CompletionPage from './pages/CompletionPage'
import PlaygroundPage from './pages/PlaygroundPage'
import ExplorePlayground from './pages/ExplorePlayground'
import ProfilePage from './pages/ProfilePage'
import { getEnrollment, getStudentProfile } from './hooks/useProgress'

function RequireEnrollment({ children }: { children: React.ReactNode }) {
  const enrollment = getEnrollment()
  if (!enrollment) return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const enrollment = getEnrollment()
  const profile = getStudentProfile()
  if (!enrollment) return <Navigate to="/" replace />
  if (!profile) return <Navigate to="/setup" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry: batch code enrollment */}
        <Route path="/" element={<SchoolEntry />} />

        {/* Step 2: name setup */}
        <Route
          path="/setup"
          element={
            <RequireEnrollment>
              <StudentProfileSetup />
            </RequireEnrollment>
          }
        />

        {/* Module list / curriculum map */}
        <Route
          path="/modules"
          element={
            <RequireProfile>
              <ModuleListPage />
            </RequireProfile>
          }
        />

        {/* Individual module */}
        <Route
          path="/module/:slug"
          element={
            <RequireProfile>
              <ModulePage />
            </RequireProfile>
          }
        />

        {/* Completion page (per module) */}
        <Route
          path="/complete/:slug"
          element={
            <RequireProfile>
              <CompletionPage />
            </RequireProfile>
          }
        />

        {/* Standalone code playground */}
        <Route
          path="/playground"
          element={
            <RequireProfile>
              <PlaygroundPage />
            </RequireProfile>
          }
        />

        {/* Profile & achievements */}
        <Route
          path="/profile"
          element={
            <RequireProfile>
              <ProfilePage />
            </RequireProfile>
          }
        />

        {/* Legacy /complete redirect */}
        <Route path="/complete" element={<Navigate to="/modules" replace />} />

        {/* Explore — all modules accessible, no auth */}
        <Route path="/explore" element={<ExplorePlayground />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
