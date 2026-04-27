import { useState, useEffect } from 'react';
import type { ExperienceEntry } from '@resume-app/shared';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from './RichTextEditor';

interface Props {
  experience: ExperienceEntry[];
  onChange: (e: ExperienceEntry[]) => void;
}

function boldHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function bulletsToHtml(bullets: string[]): string {
  return `<ul>${bullets.map(b => `<li>${boldHtml(b)}</li>`).join('')}</ul>`;
}

function EntryCard({ entry, onUpdate, onDelete }: {
  entry: ExperienceEntry;
  onUpdate: (e: ExperienceEntry) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof ExperienceEntry) => (v: string) => onUpdate({ ...entry, [key]: v });

  // Migrate old bullets array to HTML description on first open
  useEffect(() => {
    if (open && !entry.description && entry.bullets && entry.bullets.length > 0) {
      onUpdate({ ...entry, description: bulletsToHtml(entry.bullets) });
    }
  }, [open]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className="text-sm font-medium text-slate-800">{entry.title || 'Untitled Role'}</div>
          <div className="text-xs text-slate-500">{entry.company}{entry.startDate ? ` · ${entry.startDate}` : ''}</div>
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
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Job Title *</label>
              <input value={entry.title} onChange={e => set('title')(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company *</label>
              <input value={entry.company} onChange={e => set('company')(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <input value={entry.location || ''} onChange={e => set('location')(e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input value={entry.startDate} onChange={e => set('startDate')(e.target.value)}
                placeholder="Jan 2022"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
              <input value={entry.endDate} onChange={e => set('endDate')(e.target.value)}
                placeholder="Present"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <RichTextEditor
              value={entry.description}
              onChange={v => onUpdate({ ...entry, description: v })}
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceSection({ experience, onChange }: Props) {
  const add = () => onChange([...experience, {
    id: uuidv4(), company: '', title: '', startDate: '', endDate: 'Present', location: '', description: '',
  }]);

  const update = (i: number, e: ExperienceEntry) => {
    const arr = [...experience];
    arr[i] = e;
    onChange(arr);
  };

  const remove = (i: number) => onChange(experience.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {experience.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No experience added yet.</p>
      )}
      {experience.map((e, i) => (
        <EntryCard key={e.id} entry={e} onUpdate={u => update(i, u)} onDelete={() => remove(i)} />
      ))}
      <button onClick={add}
        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Add Experience
      </button>
    </div>
  );
}
