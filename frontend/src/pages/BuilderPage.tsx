import { useResume } from '../hooks/useResume';
import AppShell from '../components/layout/AppShell';
import ResumeEditor from '../components/editor/ResumeEditor';
import ResumePreview from '../components/preview/ResumePreview';
import TemplatePicker from '../components/preview/TemplatePicker';
import type { TemplateId } from '@resume-app/shared';

export default function BuilderPage() {
  const { resume, loading, saving, error, updateResume } = useResume();

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
      <AppShell
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
