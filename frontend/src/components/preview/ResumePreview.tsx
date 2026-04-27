import { useState } from 'react';
import type { ResumeData } from '@resume-app/shared';
import { getPdfUrl } from '../../api/resumeApi';
import ClassicTemplate from '../templates/ClassicTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';

interface Props {
  resume: ResumeData;
}

export default function ResumePreview({ resume }: Props) {
  const [exporting, setExporting] = useState(false);

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
        <div className="mx-auto" style={{ width: '794px' }}>
          <div
            className="bg-white shadow-xl relative"
            style={{ width: '794px', minHeight: '1123px' }}
          >
            {renderTemplate()}
            {/* Page break overlay: 4px slate line at every 1123px (A4 height) */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 1119px, #94a3b8 1119px, #94a3b8 1123px)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
