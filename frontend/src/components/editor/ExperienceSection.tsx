import { useState } from 'react';
import type { ExperienceEntry } from '@resume-app/shared';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  experience: ExperienceEntry[];
  onChange: (e: ExperienceEntry[]) => void;
}

function EntryCard({ entry, onUpdate, onDelete }: {
  entry: ExperienceEntry;
  onUpdate: (e: ExperienceEntry) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof ExperienceEntry) => (v: string) => onUpdate({ ...entry, [key]: v });

  const updateBullet = (i: number, v: string) => {
    const bullets = [...entry.bullets];
    bullets[i] = v;
    onUpdate({ ...entry, bullets });
  };
  const addBullet = () => onUpdate({ ...entry, bullets: [...entry.bullets, ''] });
  const removeBullet = (i: number) => onUpdate({ ...entry, bullets: entry.bullets.filter((_, idx) => idx !== i) });

  const toggleBold = (i: number, textarea: HTMLTextAreaElement) => {
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    let next: string;
    let cursor: [number, number];
    if (s === e) {
      next = value.slice(0, s) + '****' + value.slice(s);
      cursor = [s + 2, s + 2];
    } else {
      next = value.slice(0, s) + '**' + value.slice(s, e) + '**' + value.slice(e);
      cursor = [s, e + 4];
    }
    updateBullet(i, next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor[0], cursor[1]);
    });
  };

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
            <label className="block text-xs font-medium text-slate-600 mb-2">Bullet Points</label>
            <div className="space-y-2">
              {entry.bullets.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Bold (Ctrl+B)"
                        onMouseDown={e => { e.preventDefault(); const ta = e.currentTarget.closest('.flex-col')!.querySelector('textarea')! as HTMLTextAreaElement; toggleBold(i, ta); }}
                        className="px-1.5 py-0.5 text-xs font-bold border border-slate-300 rounded hover:bg-slate-100 text-slate-600 leading-none"
                      >B</button>
                    </div>
                    <textarea value={b} onChange={e => updateBullet(i, e.target.value)}
                      placeholder="Achieved X by doing Y, resulting in Z"
                      rows={2}
                      onKeyDown={e => { if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleBold(i, e.currentTarget); } }}
                      onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" />
                  </div>
                  <button onClick={() => removeBullet(i)} className="text-slate-400 hover:text-red-500 text-sm px-2 mt-1">✕</button>
                </div>
              ))}
            </div>
            <button onClick={addBullet}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
              + Add bullet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExperienceSection({ experience, onChange }: Props) {
  const add = () => onChange([...experience, {
    id: uuidv4(), company: '', title: '', startDate: '', endDate: 'Present', location: '', bullets: [],
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
