import { useState, useRef, useLayoutEffect } from 'react';
import type { ResumeData } from '@resume-app/shared';
import { getPdfUrl } from '../../api/resumeApi';
import ClassicTemplate from '../templates/ClassicTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';

interface Props {
  resume: ResumeData;
}

const PAGE_HEIGHT = 1123;

// visualMargin: white space (px) at the top and bottom of every page box (= @page top/bottom).
// clipOffset: top offset into the template to skip before real content starts. Classic/Minimal
// have no top padding on their root div (padding is 0 top), so clipOffset=0. Modern is rendered
// via its own JS pagination and doesn't use this clipping path at all.
const TEMPLATE_PAGE_CONFIG: Record<string, { visualMargin: number; clipOffset: number }> = {
  classic:  { visualMargin: 40, clipOffset: 0 },
  minimal:  { visualMargin: 40, clipOffset: 0 },
  modern:   { visualMargin: 0,  clipOffset: 0 },
};

export default function ResumePreview({ resume }: Props) {
  const [exporting, setExporting] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);

  const { visualMargin, clipOffset } = TEMPLATE_PAGE_CONFIG[resume.selectedTemplate] ?? { visualMargin: 40, clipOffset: 40 };
  const contentPerPage = PAGE_HEIGHT - 2 * visualMargin;

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      if (!measureRef.current) return;
      const h = measureRef.current.scrollHeight;
      setNumPages(Math.max(1, Math.ceil((h - 2 * clipOffset) / contentPerPage)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [resume]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(getPdfUrl(resume.id));
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.contact.name || 'resume'}-resume.pdf`.replace(/\s+/g, '-');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export PDF. Make sure the backend is running.');
    } finally {
      setExporting(false);
    }
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.contact.name || 'resume'}-resume.json`.replace(/\s+/g, '-');
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderTemplate() {
    switch (resume.selectedTemplate) {
      case 'modern': return <ModernTemplate resume={resume} />;
      case 'minimal': return <MinimalTemplate resume={resume} />;
      case 'classic':
      default: return <ClassicTemplate resume={resume} />;
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <span className="text-xs text-slate-500">Live Preview</span>
        <div className="flex items-center gap-2">
        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-4 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export JSON
        </button>
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
      </div>

      {/* A4 page preview */}
      <div className="flex-1 overflow-auto bg-slate-200 p-6">
        {resume.selectedTemplate === 'modern' ? (
          // Modern template handles its own pagination — render directly with page gap + shadow
          <div className="mx-auto" style={{ width: '794px' }}>
            <style>{`
              .modern-preview { display: flex; flex-direction: column; gap: 16px; }
              .modern-preview .resume-modern { box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1); }
            `}</style>
            <div className="modern-preview">
              <ModernTemplate resume={resume} />
            </div>
          </div>
        ) : (
          <div className="mx-auto" style={{ width: '794px', position: 'relative' }}>
            {/* Hidden render used only to measure total content height */}
            <div
              ref={measureRef}
              aria-hidden
              style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: '794px', top: 0, left: 0 }}
            >
              {renderTemplate()}
            </div>

            {/* One white A4 box per page with equal top/bottom margins on every page */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.from({ length: numPages }, (_, i) => (
                <div
                  key={i}
                  className="bg-white shadow-xl"
                  style={{ width: '794px', height: `${PAGE_HEIGHT}px`, overflow: 'hidden', position: 'relative' }}
                >
                  {/* Content-clip sits inside the margin areas (top/bottom visualMargin px stay white) */}
                  <div style={{ position: 'absolute', top: visualMargin, height: contentPerPage, width: '100%', overflow: 'hidden' }}>
                    {/* Content-inner is offset so the correct page slice is visible */}
                    <div style={{ position: 'absolute', top: `${-(clipOffset + i * contentPerPage)}px`, width: '100%' }}>
                      {renderTemplate()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
