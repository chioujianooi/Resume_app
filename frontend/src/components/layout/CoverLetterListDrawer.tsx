import type { CoverLetterSummary } from '@resume-app/shared';

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface CoverLetterListDrawerProps {
  open: boolean;
  coverLetters: CoverLetterSummary[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onBackToResume: () => void;
  onClose: () => void;
}

export default function CoverLetterListDrawer({
  open,
  coverLetters,
  activeId,
  onSelect,
  onDelete,
  onNew,
  onBackToResume,
  onClose,
}: CoverLetterListDrawerProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-white shadow-xl flex flex-col
          transition-transform duration-200 ease-in-out border-r border-slate-200
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <span className="font-semibold text-slate-800 text-sm">My Cover Letters</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {coverLetters.length === 0 && (
            <p className="text-slate-400 text-xs text-center mt-6">No cover letters yet</p>
          )}
          {coverLetters.map(cl => (
            <div
              key={cl.id}
              className={`group flex items-stretch transition-colors
                ${cl.id === activeId ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-slate-50'}`}
            >
              <button
                onClick={() => { onSelect(cl.id); onClose(); }}
                className="flex-1 min-w-0 text-left px-4 py-3 flex flex-col gap-0.5"
              >
                <span className={`text-sm font-medium truncate ${cl.id === activeId ? 'text-blue-700' : 'text-slate-800'}`}>
                  {cl.name || 'Untitled Cover Letter'}
                </span>
                <span className="text-xs text-slate-400">{formatRelativeTime(cl.updatedAt)}</span>
              </button>
              <button
                onClick={() => { onDelete(cl.id); onClose(); }}
                className="opacity-0 group-hover:opacity-100 px-2 text-slate-400 hover:text-red-500 transition-opacity"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-200 flex flex-col gap-2">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full py-2 text-sm text-blue-600 font-medium rounded-lg
              hover:bg-blue-50 transition-colors border border-blue-200"
          >
            + New Cover Letter
          </button>
          <button
            onClick={() => { onBackToResume(); onClose(); }}
            className="w-full py-2 text-sm text-slate-600 font-medium rounded-lg
              hover:bg-slate-50 transition-colors border border-slate-200"
          >
            ← Resume Builder
          </button>
        </div>
      </div>
    </>
  );
}
