import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AboutMetrics from './pages/AboutMetrics';
import Login from './pages/Login';
import Contributors from './pages/Contributors';
import ActivityLogs from './pages/ActivityLogs';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contributors"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Contributors />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ActivityLogs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/metrics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AboutMetrics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
