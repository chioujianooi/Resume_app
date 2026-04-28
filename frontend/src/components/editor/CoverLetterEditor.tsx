import type { CoverLetterData } from '@resume-app/shared';
import RichTextEditor from './RichTextEditor';

interface Props {
  coverLetter: CoverLetterData;
  onChange: (cl: CoverLetterData) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function CoverLetterEditor({ coverLetter, onChange }: Props) {
  const set = (patch: Partial<CoverLetterData>) => onChange({ ...coverLetter, ...patch });

  return (
    <div className="flex flex-col gap-5 p-5">
      <Field label="Target Job / Position">
        <input
          type="text"
          value={coverLetter.targetJob}
          onChange={e => set({ targetJob: e.target.value })}
          placeholder="e.g. Software Engineer"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Target Company">
        <input
          type="text"
          value={coverLetter.targetCompany}
          onChange={e => set({ targetCompany: e.target.value })}
          placeholder="e.g. Acme Corp"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Date">
        <input
          type="text"
          value={coverLetter.date}
          onChange={e => set({ date: e.target.value })}
          placeholder="e.g. April 28, 2026"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Opening">
        <RichTextEditor
          value={coverLetter.opening}
          onChange={html => set({ opening: html })}
          placeholder="Dear Hiring Manager,"
        />
      </Field>

      <Field label="Body">
        <div className="[&_.rte]:min-h-[12rem]">
          <RichTextEditor
            value={coverLetter.body}
            onChange={html => set({ body: html })}
            placeholder="Write the main body of your cover letter..."
          />
        </div>
      </Field>

      <Field label="Closing">
        <RichTextEditor
          value={coverLetter.closing}
          onChange={html => set({ closing: html })}
          placeholder="Thank you for your consideration..."
        />
      </Field>
    </div>
  );
}
