import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AboutMetrics from './pages/AboutMetrics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/metrics"
          element={
            <DashboardLayout>
              <AboutMetrics />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
