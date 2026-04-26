import type { ResumeSummary } from '@resume-app/shared';

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

interface ResumeListDrawerProps {
  open: boolean;
  resumes: ResumeSummary[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

export default function ResumeListDrawer({ open, resumes, activeId, onSelect, onNew, onClose }: ResumeListDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-white shadow-xl flex flex-col
          transition-transform duration-200 ease-in-out border-r border-slate-200
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <span className="font-semibold text-slate-800 text-sm">My Resumes</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Resume list */}
        <div className="flex-1 overflow-y-auto py-1">
          {resumes.length === 0 && (
            <p className="text-slate-400 text-xs text-center mt-6">No resumes yet</p>
          )}
          {resumes.map(r => (
            <button
              key={r.id}
              onClick={() => { onSelect(r.id); onClose(); }}
              className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 hover:bg-slate-50
                transition-colors ${r.id === activeId ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
            >
              <span className={`text-sm font-medium truncate ${r.id === activeId ? 'text-blue-700' : 'text-slate-800'}`}>
                {r.name || 'Untitled Resume'}
              </span>
              <span className="text-xs text-slate-400">{formatRelativeTime(r.updatedAt)}</span>
            </button>
          ))}
        </div>

        {/* New resume button */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full py-2 text-sm text-blue-600 font-medium rounded-lg
              hover:bg-blue-50 transition-colors border border-blue-200"
          >
            + New Resume
          </button>
        </div>
      </div>
    </>
  );
}
