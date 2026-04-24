import { useState } from 'react';
import type { EducationEntry } from '@resume-app/shared';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  education: EducationEntry[];
  onChange: (e: EducationEntry[]) => void;
}

function EntryCard({ entry, onUpdate, onDelete }: {
  entry: EducationEntry;
  onUpdate: (e: EducationEntry) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const set = (key: keyof EducationEntry) => (v: string) => onUpdate({ ...entry, [key]: v });

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className="text-sm font-medium text-slate-800">{entry.institution || 'Untitled Institution'}</div>
          <div className="text-xs text-slate-500">{entry.degree}{entry.field ? ` in ${entry.field}` : ''}</div>
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
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 mt-0">
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">Institution *</label>
            <input value={entry.institution} onChange={e => set('institution')(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Degree</label>
              <input value={entry.degree} onChange={e => set('degree')(e.target.value)}
                placeholder="Bachelor of Science"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Field of Study</label>
              <input value={entry.field} onChange={e => set('field')(e.target.value)}
                placeholder="Computer Science"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start</label>
              <input value={entry.startDate} onChange={e => set('startDate')(e.target.value)}
                placeholder="Sep 2018"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End</label>
              <input value={entry.endDate} onChange={e => set('endDate')(e.target.value)}
                placeholder="May 2022"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">GPA</label>
              <input value={entry.gpa || ''} onChange={e => set('gpa')(e.target.value)}
                placeholder="3.8"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EducationSection({ education, onChange }: Props) {
  const add = () => onChange([...education, {
    id: uuidv4(), institution: '', degree: '', field: '', startDate: '', endDate: '',
  }]);

  const update = (i: number, e: EducationEntry) => {
    const arr = [...education];
    arr[i] = e;
    onChange(arr);
  };

  const remove = (i: number) => onChange(education.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {education.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No education added yet.</p>
      )}
      {education.map((e, i) => (
        <EntryCard key={e.id} entry={e} onUpdate={u => update(i, u)} onDelete={() => remove(i)} />
      ))}
      <button onClick={add}
        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Add Education
      </button>
    </div>
  );
}
