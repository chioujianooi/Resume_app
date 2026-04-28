import { useState, useRef, useLayoutEffect } from 'react';
import type { CoverLetterData, ResumeLanguage } from '@resume-app/shared';
import { getCoverLetterPdfUrl } from '../../api/coverLetterApi';
import CoverLetterTemplate from '../templates/CoverLetterTemplate';

interface Props {
  coverLetter: CoverLetterData;
  onLanguageChange: (lang: ResumeLanguage) => void;
}

const PAGE_HEIGHT = 1123;

const LANGUAGES: { id: ResumeLanguage; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'de', label: 'DE' },
];

export default function CoverLetterPreview({ coverLetter, onLanguageChange }: Props) {
  const [exporting, setExporting] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      if (!measureRef.current) return;
      setNumPages(Math.max(1, Math.ceil(measureRef.current.scrollHeight / PAGE_HEIGHT)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [coverLetter]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(getCoverLetterPdfUrl(coverLetter.id));
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${coverLetter.contact.name || 'cover-letter'}-cover-letter.pdf`.replace(/\s+/g, '-');
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export PDF. Make sure the backend is running.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Language:</span>
          {LANGUAGES.map(lang => (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                (coverLetter.language ?? 'en') === lang.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {exporting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* A4 page preview */}
      <div className="flex-1 overflow-auto bg-slate-200 p-6">
        <div className="mx-auto" style={{ width: '794px', position: 'relative' }}>
          {/* Hidden measure target */}
          <div
            ref={measureRef}
            aria-hidden
            style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: '794px', top: 0, left: 0 }}
          >
            <CoverLetterTemplate coverLetter={coverLetter} />
          </div>

          {/* Visible paginated pages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={i}
                className="bg-white shadow-xl"
                style={{ width: '794px', height: `${PAGE_HEIGHT}px`, overflow: 'hidden', position: 'relative' }}
              >
                <div style={{ position: 'absolute', top: 0, height: PAGE_HEIGHT, width: '100%', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: `${-(i * PAGE_HEIGHT)}px`, width: '100%' }}>
                    <CoverLetterTemplate coverLetter={coverLetter} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
