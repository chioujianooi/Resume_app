import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoverLetter } from '../hooks/useCoverLetter';
import AppShell from '../components/layout/AppShell';
import CoverLetterEditor from '../components/editor/CoverLetterEditor';
import CoverLetterPreview from '../components/preview/CoverLetterPreview';
import CoverLetterListDrawer from '../components/layout/CoverLetterListDrawer';
import { createCoverLetter } from '../api/coverLetterApi';
import { listResumes } from '../api/resumeApi';
import type { ResumeSummary } from '@resume-app/shared';

// Inline name input — mirrors ResumeNameInput
function CoverLetterNameInput({ name, onRename }: { name: string; onRename: (n: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  function handleFocus() {
    setValue(name);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed !== name) onRename(trimmed);
  }

  return (
    <input
      type="text"
      value={editing ? value : name}
      placeholder="Untitled Cover Letter"
      maxLength={80}
      className="bg-transparent border-none outline-none font-semibold text-slate-800 text-lg
        placeholder:text-slate-400 hover:underline focus:underline decoration-slate-300
        underline-offset-2 w-48 truncate cursor-pointer focus:cursor-text"
      onFocus={handleFocus}
      onChange={e => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') { setValue(name); setEditing(false); }
      }}
    />
  );
}

// Resume picker shown when no cover letter exists yet
function ResumePicker({ onCreated }: { onCreated: (id: string) => void }) {
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listResumes().then(setResumes).catch(() => {});
  }, []);

  async function handleSelect(resumeId: string) {
    setCreating(true);
    try {
      const id = await createCoverLetter(resumeId);
      onCreated(id);
    } catch {
      alert('Failed to create cover letter. Make sure the backend is running.');
      setCreating(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full mx-4">
        <h2 className="text-slate-800 font-semibold text-lg mb-1">New Cover Letter</h2>
        <p className="text-slate-500 text-sm mb-5">Choose a resume to base it on:</p>

        {resumes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm mb-4">No resumes found. Create a resume first.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Go to Resume Builder
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {resumes.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                disabled={creating}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200
                  hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm font-medium text-slate-800">
                  {r.name || 'Untitled Resume'}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full py-2 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Resume Builder
        </button>
      </div>
    </div>
  );
}

export default function CoverLetterBuilderPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const {
    coverLetter,
    coverLetterList,
    loading,
    saving,
    error,
    updateCoverLetter,
    switchCoverLetter,
    removeCoverLetter,
  } = useCoverLetter(paramId);

  // Load the cover letter whenever the URL id changes (including the null→id transition after creation)
  useEffect(() => {
    if (paramId && (!coverLetter || coverLetter.id !== paramId)) {
      switchCoverLetter(paramId);
    }
  }, [paramId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading...</p>
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

  // No cover letters exist yet — show picker or the resume selector
  if (!coverLetter || showPicker) {
    return (
      <ResumePicker
        onCreated={(newId) => {
          setShowPicker(false);
          navigate(`/cover-letter/${newId}`);
        }}
      />
    );
  }

  function handleRename(name: string) {
    if (!coverLetter) return;
    updateCoverLetter({ ...coverLetter, name });
  }

  return (
    <div className="relative">
      {saving && (
        <div className="fixed top-3 right-4 z-50 text-xs text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
          Saving...
        </div>
      )}

      <CoverLetterListDrawer
        open={drawerOpen}
        coverLetters={coverLetterList}
        activeId={coverLetter.id}
        onSelect={(id) => { switchCoverLetter(id); navigate(`/cover-letter/${id}`); }}
        onDelete={removeCoverLetter}
        onNew={() => setShowPicker(true)}
        onBackToResume={() => navigate('/')}
        onClose={() => setDrawerOpen(false)}
      />

      <AppShell
        headerLeft={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
              aria-label="My Cover Letters"
              title="My Cover Letters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <CoverLetterNameInput
              name={coverLetter.name ?? ''}
              onRename={handleRename}
            />
          </div>
        }
        headerRight={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              ← Resume Builder
            </button>
            <span className="text-xs text-slate-400">Auto-saves</span>
          </div>
        }
        editor={<CoverLetterEditor coverLetter={coverLetter} onChange={updateCoverLetter} />}
        preview={
          <CoverLetterPreview
            coverLetter={coverLetter}
            onLanguageChange={lang => updateCoverLetter({ ...coverLetter, language: lang })}
          />
        }
      />
    </div>
  );
}
