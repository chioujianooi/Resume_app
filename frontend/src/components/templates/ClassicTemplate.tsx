import type { ResumeData } from '@resume-app/shared';
import { LABELS } from '../../utils/templateLabels';

const CSS = `
  @page { margin: 40px 48px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, .resume-root { font-family: 'Georgia', serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; min-height: 297mm; }
  .header { text-align: center; margin-bottom: 20px; }
  .name { font-size: 26pt; font-weight: bold; letter-spacing: 1px; }
  .contact-line { font-size: 9.5pt; color: #444; margin-top: 6px; }
  hr { border: none; border-top: 1.5px solid #222; margin: 14px 0 10px; }
  .section-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .summary { font-size: 10.5pt; margin-bottom: 16px; }
  .entry { margin-bottom: 20px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: bold; font-size: 12pt; }
  .entry-subtitle { font-style: italic; font-size: 10pt; color: #444; }
  .entry-date { font-size: 9.5pt; color: #555; white-space: nowrap; }
  .entry-body { margin-top: 4px; font-size: 10pt; color: #444; }
  .entry-body ul { padding-left: 20px; list-style-type: disc; margin: 2px 0; }
  .entry-body ol { padding-left: 20px; list-style-type: decimal; margin: 2px 0; }
  .entry-body li { margin-bottom: 2px; overflow-wrap: break-word; }
  .entry-body p, .entry-body div { margin: 1px 0; }
  .skills-list { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 10pt; }
  .skill-item { font-size: 10pt; }
  .skill-level { color: #666; font-style: italic; }
  .project-tech { font-size: 9pt; color: #555; margin-top: 2px; }
  .section { margin-bottom: 16px; }
`;

const LEVEL_LABELS = ['', 'Basic', 'Familiar', 'Intermediate', 'Advanced', 'Expert'];
const LANG_LEVEL_LABELS = ['', 'Basic', 'Conversational', 'Intermediate', 'Advanced', 'Native'];

export default function ClassicTemplate({ resume }: { resume: ResumeData }) {
  const { contact, summary, experience, education, skills, languages, projects } = resume;
  const L = LABELS.classic[resume.language ?? 'en'];
  const plainParts = [contact.email, contact.phone, contact.location].filter(Boolean);
  const links = contact.links ?? [];

  return (
    <div className="resume-root" style={{ fontFamily: 'Georgia, serif', fontSize: '11pt', color: '#1a1a1a', padding: '40px 48px', lineHeight: 1.5 }}>
      <style>{CSS}</style>

      <div className="header">
        <div className="name">{contact.name || 'Your Name'}</div>
        <div className="contact-line">
          {plainParts.join(' | ')}
          {plainParts.length > 0 && links.length > 0 && ' | '}
          {links.map((l, i) => (
            <span key={i}>
              {i > 0 && ' | '}
              <a href={l.url} style={{ color: '#444', textDecoration: 'none' }}>{l.label || l.url}</a>
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <div className="section">
          <hr />
          <div className="section-title">{L.summary}</div>
          <div className="summary" dangerouslySetInnerHTML={{ __html: summary }} />
        </div>
      )}

      {experience.length > 0 && (
        <div className="section">
          <hr />
          <div className="section-title">{L.experience}</div>
          {experience.map(e => (
            <div key={e.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{e.title}</span>
                <span className="entry-date">{e.startDate} – {e.endDate}</span>
              </div>
              <div className="entry-subtitle">{e.company}{e.location ? `, ${e.location}` : ''}</div>
              {(e.description || (e.bullets?.length ?? 0) > 0) && (
                <div className="entry-body" dangerouslySetInnerHTML={{ __html: e.description || `<ul>${(e.bullets ?? []).map(b => `<li>${b}</li>`).join('')}</ul>` }} />
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="section">
          <hr />
          <div className="section-title">{L.education}</div>
          {education.map(e => (
            <div key={e.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{e.degree} in {e.field}</span>
                <span className="entry-date">{e.startDate} – {e.endDate}</span>
              </div>
              <div className="entry-subtitle">{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="section">
          <hr />
          <div className="section-title">{L.skills}</div>
          <div className="skills-list">
            {skills.map(s => (
              <span key={s.name} className="skill-item">
                {s.name} · <span className="skill-level">{LEVEL_LABELS[s.level] ?? ''}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {(languages ?? []).length > 0 && (
        <div className="section">
          <hr />
          <div className="section-title">{L.languages}</div>
          <div className="skills-list">
            {(languages ?? []).map(l => (
              <span key={l.name} className="skill-item">
                {l.name} · <span className="skill-level">{LANG_LEVEL_LABELS[l.level] ?? ''}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="section">
          <hr />
          <div className="section-title">{L.projects}</div>
          {projects.map(p => (
            <div key={p.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{p.name}</span>
                {p.url && <span style={{ fontSize: '9pt', color: '#555' }}>{p.url}</span>}
              </div>
              <div style={{ fontSize: '10pt' }}>{p.description}</div>
              {p.technologies.length > 0 && <div className="project-tech">{L.technologies} {p.technologies.join(', ')}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
