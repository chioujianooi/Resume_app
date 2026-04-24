import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { SkillEntry } from '@resume-app/shared';

interface Props {
  skills: SkillEntry[];
  onChange: (s: SkillEntry[]) => void;
}

function LevelDots({ level, onChange }: { level: number; onChange: (l: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => onChange(i)}
          title={`Level ${i}`}
          className={`w-3 h-3 rounded-full border transition-colors ${
            i <= level ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 hover:border-blue-400'
          }`}
        />
      ))}
    </div>
  );
}

export default function SkillsSection({ skills, onChange }: Props) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.find(s => s.name === trimmed)) {
      onChange([...skills, { name: trimmed, level: 3 }]);
    }
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
  };

  const remove = (name: string) => onChange(skills.filter(s => s.name !== name));

  const setLevel = (name: string, level: number) =>
    onChange(skills.map(s => s.name === name ? { ...s, level } : s));

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Add Skill</label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="e.g. TypeScript (press Enter or comma to add)"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={add}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {skills.length === 0 && (
          <span className="text-sm text-slate-400">No skills added yet.</span>
        )}
        {skills.map(s => (
          <div key={s.name} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
            <span className="flex-1 text-sm text-slate-700">{s.name}</span>
            <LevelDots level={s.level} onChange={l => setLevel(s.name, l)} />
            <button onClick={() => remove(s.name)} className="text-slate-400 hover:text-red-500 transition-colors text-sm leading-none">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
