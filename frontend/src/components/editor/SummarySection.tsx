interface Props {
  summary: string;
  onChange: (s: string) => void;
}

export default function SummarySection({ summary, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Professional Summary</label>
      <textarea
        value={summary}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder="A brief paragraph about your background, skills, and career goals..."
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-xs text-slate-400 mt-1">{summary.length} characters</p>
    </div>
  );
}
