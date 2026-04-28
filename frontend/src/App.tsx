import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuilderPage from './pages/BuilderPage';
import PrintPage from './pages/PrintPage';
import CoverLetterBuilderPage from './pages/CoverLetterBuilderPage';
import CoverLetterPrintPage from './pages/CoverLetterPrintPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/resume/:id/print" element={<PrintPage />} />
        <Route path="/cover-letter" element={<CoverLetterBuilderPage />} />
        <Route path="/cover-letter/:id" element={<CoverLetterBuilderPage />} />
        <Route path="/cover-letter/:id/print" element={<CoverLetterPrintPage />} />
      </Routes>
    </BrowserRouter>
  );
}
