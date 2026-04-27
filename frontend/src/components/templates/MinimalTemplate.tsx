import type { ResumeData } from '@resume-app/shared';
import { LABELS } from '../../utils/templateLabels';

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .resume-minimal { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10.5pt; color: #333; padding: 48px 56px; line-height: 1.6; }
  .name { font-size: 30pt; font-weight: 300; letter-spacing: -0.5px; margin-bottom: 6px; color: #111; }
  .contact-line { font-size: 9.5pt; color: #666; margin-bottom: 36px; }
  .contact-line span + span::before { content: '  ·  '; color: #bbb; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 8pt; text-transform: uppercase; letter-spacing: 3px; color: #999; margin-bottom: 14px; }
  .divider { border: none; border-top: 1px dotted #ccc; margin-bottom: 14px; }
  .entry { margin-bottom: 14px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 600; font-size: 10.5pt; }
  .entry-subtitle { font-size: 10pt; color: #666; margin-top: 1px; }
  .entry-date { font-size: 9pt; color: #aaa; white-space: nowrap; }
  .entry-body { margin-top: 5px; font-size: 10pt; color: #444; }
  .entry-body ul { padding-left: 20px; list-style-type: disc; margin: 2px 0; }
  .entry-body ol { padding-left: 20px; list-style-type: decimal; margin: 2px 0; }
  .entry-body li { margin-bottom: 3px; overflow-wrap: break-word; }
  .entry-body p, .entry-body div { margin: 1px 0; }
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-item { display: flex; align-items: center; gap: 6px; font-size: 9.5pt; color: #555; border: 1px solid #ddd; padding: 3px 10px; border-radius: 3px; }
  .skill-level { font-size: 8.5pt; color: #888; font-style: italic; }
  .project-tech { font-size: 9pt; color: #888; margin-top: 3px; }
  .summary { font-size: 10.5pt; color: #444; }
`;

const LEVEL_LABELS = ['', 'Basic', 'Familiar', 'Intermediate', 'Advanced', 'Expert'];
const LANG_LEVEL_LABELS = ['', 'Basic', 'Conversational', 'Intermediate', 'Advanced', 'Native'];

export default function MinimalTemplate({ resume }: { resume: ResumeData }) {
  const { contact, summary, experience, education, skills, languages, projects } = resume;
  const L = LABELS.minimal[resume.language ?? 'en'];

  return (
    <div className="resume-minimal" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', padding: '48px 56px' }}>
      <style>{CSS}</style>

      <div className="name">{contact.name || 'Your Name'}</div>
      <div className="contact-line">
        {[contact.email, contact.phone, contact.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        {(contact.links ?? []).map((l, i) => (
          <span key={`link-${i}`}>
            <a href={l.url} style={{ color: '#666', textDecoration: 'none' }}>{l.label || l.url}</a>
          </span>
        ))}
      </div>

      {summary && (
        <div className="section">
          <div className="section-title">{L.about}</div>
          <hr className="divider" />
          <div className="summary">{summary}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="section">
          <div className="section-title">{L.experience}</div>
          <hr className="divider" />
          {experience.map(e => (
            <div key={e.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{e.title} — {e.company}</span>
                <span className="entry-date">{e.startDate} – {e.endDate}</span>
              </div>
              {e.location && <div className="entry-subtitle">{e.location}</div>}
              {(e.description || (e.bullets?.length ?? 0) > 0) && (
                <div className="entry-body" dangerouslySetInnerHTML={{ __html: e.description || `<ul>${(e.bullets ?? []).map(b => `<li>${b}</li>`).join('')}</ul>` }} />
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="section">
          <div className="section-title">{L.education}</div>
          <hr className="divider" />
          {education.map(e => (
            <div key={e.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{e.institution}</span>
                <span className="entry-date">{e.startDate} – {e.endDate}</span>
              </div>
              <div className="entry-subtitle">{e.degree} in {e.field}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="section">
          <div className="section-title">{L.skills}</div>
          <hr className="divider" />
          <div className="skills-wrap">
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
          <div className="section-title">{L.languages}</div>
          <hr className="divider" />
          <div className="skills-wrap">
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
          <div className="section-title">{L.projects}</div>
          <hr className="divider" />
          {projects.map(p => (
            <div key={p.id} className="entry">
              <div className="entry-header">
                <span className="entry-title">{p.name}</span>
                {p.url && <span style={{ fontSize: '9pt', color: '#888' }}>{p.url}</span>}
              </div>
              <div style={{ fontSize: '10pt', color: '#444' }}>{p.description}</div>
              {p.technologies.length > 0 && <div className="project-tech">{p.technologies.join(' · ')}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
