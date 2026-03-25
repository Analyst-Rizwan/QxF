import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SchoolEntry from './pages/SchoolEntry'
import ModulePage from './pages/ModulePage'
import CompletionPage from './pages/CompletionPage'
import DashboardPage from './pages/DashboardPage'
import { getEnrollment } from './hooks/useProgress'

function RequireEnrollment({ children }: { children: React.ReactNode }) {
  const enrollment = getEnrollment()
  if (!enrollment) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SchoolEntry />} />
        <Route
          path="/module/:slug"
          element={
            <RequireEnrollment>
              <ModulePage />
            </RequireEnrollment>
          }
        />
        <Route
          path="/complete"
          element={
            <RequireEnrollment>
              <CompletionPage />
            </RequireEnrollment>
          }
        />
        <Route path="/coordinator" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
