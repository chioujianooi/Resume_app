import type { ResumeData } from '@resume-app/shared';
import { parseBold } from '../../utils/bulletFormat';
import { LABELS } from '../../utils/templateLabels';

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, .resume-root { font-family: 'Georgia', serif; font-size: 11pt; color: #1a1a1a; padding: 40px 48px; line-height: 1.5; }
  .header { text-align: center; margin-bottom: 20px; }
  .name { font-size: 26pt; font-weight: bold; letter-spacing: 1px; }
  .contact-line { font-size: 9.5pt; color: #444; margin-top: 6px; }
  hr { border: none; border-top: 1.5px solid #222; margin: 14px 0 10px; }
  .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .summary { font-size: 10.5pt; margin-bottom: 16px; }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: bold; font-size: 10.5pt; }
  .entry-subtitle { font-style: italic; font-size: 10pt; color: #444; }
  .entry-date { font-size: 9.5pt; color: #555; white-space: nowrap; }
  .bullets { margin-top: 4px; padding-left: 16px; list-style-type: disc; }
  .bullets li { font-size: 10pt; margin-bottom: 2px; overflow-wrap: break-word; }
  .skills-list { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size: 10pt; }
  .skill-item { display: flex; align-items: center; gap: 6px; }
  .skill-dots { display: flex; gap: 2px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
  .dot-filled { background: #1a1a1a; }
  .dot-empty { background: #ccc; }
  .project-tech { font-size: 9pt; color: #555; margin-top: 2px; }
  .section { margin-bottom: 16px; }
`;

export default function ClassicTemplate({ resume }: { resume: ResumeData }) {
  const { contact, summary, experience, education, skills, projects } = resume;
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
          <div className="summary">{summary}</div>
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
              {e.bullets.length > 0 && (
                <ul className="bullets">{e.bullets.map((b, i) => <li key={i}>{parseBold(b)}</li>)}</ul>
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
                {s.name}
                <span className="skill-dots">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={`dot ${i <= s.level ? 'dot-filled' : 'dot-empty'}`} />
                  ))}
                </span>
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
