import { useState } from 'react';
import { useResume } from '../hooks/useResume';
import AppShell from '../components/layout/AppShell';
import ResumeEditor from '../components/editor/ResumeEditor';
import ResumePreview from '../components/preview/ResumePreview';
import TemplatePicker from '../components/preview/TemplatePicker';
import ResumeNameInput from '../components/layout/ResumeNameInput';
import ResumeListDrawer from '../components/layout/ResumeListDrawer';
import type { TemplateId } from '@resume-app/shared';

export default function BuilderPage() {
  const { resume, loading, saving, error, updateResume, renameResume, resumeList, switchResume, createNewResume } = useResume();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading resume builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-slate-800 font-semibold mb-2">Backend not reachable</h2>
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="relative">
      {saving && (
        <div className="fixed top-3 right-4 z-50 text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
          Saving...
        </div>
      )}

      <ResumeListDrawer
        open={drawerOpen}
        resumes={resumeList}
        activeId={resume.id}
        onSelect={switchResume}
        onNew={createNewResume}
        onClose={() => setDrawerOpen(false)}
      />

      <AppShell
        headerLeft={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              aria-label="My Resumes"
              title="My Resumes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ResumeNameInput name={resume.name ?? ''} onRename={renameResume} />
          </div>
        }
        headerRight={
          <span className="text-xs text-slate-400">Auto-saves</span>
        }
        editor={<ResumeEditor resume={resume} onChange={updateResume} />}
        preview={
          <div className="flex flex-col h-full">
            <TemplatePicker
              selected={resume.selectedTemplate}
              onChange={(id: TemplateId) => updateResume({ ...resume, selectedTemplate: id })}
            />
            <div className="flex-1 overflow-hidden">
              <ResumePreview resume={resume} />
            </div>
          </div>
        }
      />
    </div>
  );
}
