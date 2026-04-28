import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuilderPage from './pages/BuilderPage';
import PrintPage from './pages/PrintPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/resume/:id/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  );
}
