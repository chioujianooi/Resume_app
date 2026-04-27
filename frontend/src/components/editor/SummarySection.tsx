import RichTextEditor from './RichTextEditor';

interface Props {
  summary: string;
  onChange: (s: string) => void;
}

export default function SummarySection({ summary, onChange }: Props) {
  const charCount = summary.replace(/<[^>]*>/g, '').length;
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Professional Summary</label>
      <RichTextEditor
        value={summary}
        onChange={onChange}
        placeholder="A brief paragraph about your background, skills, and career goals..."
      />
      <p className="text-xs text-slate-400 mt-1">{charCount} characters</p>
    </div>
  );
}
