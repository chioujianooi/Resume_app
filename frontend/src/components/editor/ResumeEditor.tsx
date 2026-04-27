import { useState } from 'react';
import type { ResumeData } from '@resume-app/shared';
import ContactSection from './ContactSection';
import SummarySection from './SummarySection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import LanguagesSection from './LanguagesSection';
import ProjectsSection from './ProjectsSection';

type Tab = 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'projects';

const TABS: { id: Tab; label: string }[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'languages', label: 'Languages' },
  { id: 'projects', label: 'Projects' },
];

interface Props {
  resume: ResumeData;
  onChange: (r: ResumeData) => void;
}

export default function ResumeEditor({ resume, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('contact');

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {tab === 'contact' && (
          <ContactSection contact={resume.contact} onChange={c => onChange({ ...resume, contact: c })} />
        )}
        {tab === 'summary' && (
          <SummarySection summary={resume.summary} onChange={s => onChange({ ...resume, summary: s })} />
        )}
        {tab === 'experience' && (
          <ExperienceSection experience={resume.experience} onChange={e => onChange({ ...resume, experience: e })} />
        )}
        {tab === 'education' && (
          <EducationSection education={resume.education} onChange={e => onChange({ ...resume, education: e })} />
        )}
        {tab === 'skills' && (
          <SkillsSection skills={resume.skills} onChange={s => onChange({ ...resume, skills: s })} />
        )}
        {tab === 'languages' && (
          <LanguagesSection languages={resume.languages ?? []} onChange={l => onChange({ ...resume, languages: l })} />
        )}
        {tab === 'projects' && (
          <ProjectsSection projects={resume.projects} onChange={p => onChange({ ...resume, projects: p })} />
        )}
      </div>
    </div>
  );
}
