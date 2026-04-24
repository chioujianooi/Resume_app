import type { TemplateId } from '@resume-app/shared';

interface Template {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
}

const TEMPLATES: Template[] = [
  { id: 'classic', name: 'Classic', description: 'Serif, traditional', accent: '#1a1a1a' },
  { id: 'modern', name: 'Modern', description: 'Navy sidebar', accent: '#1e3a5f' },
  { id: 'minimal', name: 'Minimal', description: 'Airy & clean', accent: '#888' },
];

interface Props {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplatePicker({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
      <span className="text-xs font-medium text-slate-500 mr-1">Template:</span>
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            selected === t.id
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: t.accent }}
          />
          {t.name}
        </button>
      ))}
    </div>
  );
}
