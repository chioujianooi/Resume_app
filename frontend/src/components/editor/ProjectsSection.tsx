import { useState } from 'react';
import type { ProjectEntry } from '@resume-app/shared';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  projects: ProjectEntry[];
  onChange: (p: ProjectEntry[]) => void;
}

function EntryCard({ entry, onUpdate, onDelete }: {
  entry: ProjectEntry;
  onUpdate: (p: ProjectEntry) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [techInput, setTechInput] = useState('');
  const set = (key: keyof ProjectEntry) => (v: string) => onUpdate({ ...entry, [key]: v });

  const addTech = () => {
    const t = techInput.trim();
    if (t && !entry.technologies.includes(t)) {
      onUpdate({ ...entry, technologies: [...entry.technologies, t] });
    }
    setTechInput('');
  };

  const removeTech = (t: string) =>
    onUpdate({ ...entry, technologies: entry.technologies.filter(x => x !== t) });

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className="text-sm font-medium text-slate-800">{entry.name || 'Untitled Project'}</div>
          <div className="text-xs text-slate-500">{entry.technologies.slice(0, 3).join(', ')}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
          >Remove</button>
          <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">Project Name *</label>
            <input value={entry.name} onChange={e => set('name')(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={entry.description} onChange={e => set('description')(e.target.value)}
              rows={3} placeholder="What it does and why it matters..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">URL</label>
            <input value={entry.url || ''} onChange={e => set('url')(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Technologies</label>
            <div className="flex gap-2 mb-2">
              <input value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTech(); }}}
                placeholder="e.g. React"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addTech}
                className="px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-md hover:bg-slate-200">Add</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.technologies.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                  {t}
                  <button onClick={() => removeTech(t)} className="text-slate-400 hover:text-slate-700">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsSection({ projects, onChange }: Props) {
  const add = () => onChange([...projects, {
    id: uuidv4(), name: '', description: '', url: '', technologies: [],
  }]);

  const update = (i: number, p: ProjectEntry) => {
    const arr = [...projects];
    arr[i] = p;
    onChange(arr);
  };

  const remove = (i: number) => onChange(projects.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {projects.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No projects added yet.</p>
      )}
      {projects.map((p, i) => (
        <EntryCard key={p.id} entry={p} onUpdate={u => update(i, u)} onDelete={() => remove(i)} />
      ))}
      <button onClick={add}
        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Add Project
      </button>
    </div>
  );
}
