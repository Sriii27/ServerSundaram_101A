import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AboutMetrics from './pages/AboutMetrics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/metrics" element={<AboutMetrics />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
