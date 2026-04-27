import { ResumeData } from '@resume-app/shared';
import { LABELS } from './labels';

export const CLASSIC_CSS = `
  @page { margin: 40px 48px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', serif; font-size: 11pt; color: #1a1a1a; line-height: 1.5; min-height: 297mm; }
  .header { text-align: center; margin-bottom: 20px; }
  .name { font-size: 26pt; font-weight: bold; letter-spacing: 1px; }
  .contact-line { font-size: 9.5pt; color: #444; margin-top: 6px; }
  .contact-line a { color: #444; text-decoration: none; }
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

function boldHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function sep(items: (string | undefined)[], delimiter = ' | '): string {
  return items.filter(Boolean).join(delimiter);
}

const LEVEL_LABELS = ['', 'Basic', 'Familiar', 'Intermediate', 'Advanced', 'Expert'];
const LANG_LEVEL_LABELS = ['', 'Basic', 'Conversational', 'Intermediate', 'Advanced', 'Native'];

export function renderClassic(data: ResumeData): string {
  const { contact, summary, experience, education, skills, languages, projects } = data;
  const L = LABELS.classic[data.language ?? 'en'];

  const plainContact = sep([contact.email, contact.phone, contact.location]);
  const linksHtml = (contact.links ?? [])
    .map(l => `<a href="${l.url}" style="color:#444;text-decoration:none;">${l.label || l.url}</a>`)
    .join(' | ');
  const contactParts = [plainContact, linksHtml].filter(Boolean).join(' | ');

  const experienceHtml = experience.map(e => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${e.title}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      <div class="entry-subtitle">${e.company}${e.location ? `, ${e.location}` : ''}</div>
      ${(e.description || e.bullets?.length) ? `<div class="entry-body">${e.description || `<ul>${(e.bullets ?? []).map(b => `<li>${boldHtml(b)}</li>`).join('')}</ul>`}</div>` : ''}
    </div>
  `).join('');

  const educationHtml = education.map(e => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${e.degree} in ${e.field}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      <div class="entry-subtitle">${e.institution}${e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
    </div>
  `).join('');

  const skillsHtml = skills.map(s => `
    <span class="skill-item">
      ${s.name} · <span class="skill-level">${LEVEL_LABELS[s.level] ?? ''}</span>
    </span>
  `).join('');

  const languagesHtml = (languages ?? []).map(l => `
    <span class="skill-item">
      ${l.name} · <span class="skill-level">${LANG_LEVEL_LABELS[l.level] ?? ''}</span>
    </span>
  `).join('');

  const projectsHtml = projects.map(p => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${p.name}</span>
        ${p.url ? `<a href="${p.url}" style="font-size:9pt;color:#555;">${p.url}</a>` : ''}
      </div>
      <div style="font-size:10pt;">${p.description}</div>
      ${p.technologies.length ? `<div class="project-tech">${L.technologies} ${p.technologies.join(', ')}</div>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${CLASSIC_CSS}</style>
</head>
<body>
  <div class="header">
    <div class="name">${contact.name}</div>
    <div class="contact-line">${contactParts}</div>
  </div>

  ${summary ? `
  <div class="section">
    <hr>
    <div class="section-title">${L.summary}</div>
    <div class="summary">${summary}</div>
  </div>` : ''}

  ${experience.length ? `
  <div class="section">
    <hr>
    <div class="section-title">${L.experience}</div>
    ${experienceHtml}
  </div>` : ''}

  ${education.length ? `
  <div class="section">
    <hr>
    <div class="section-title">${L.education}</div>
    ${educationHtml}
  </div>` : ''}

  ${skills.length ? `
  <div class="section">
    <hr>
    <div class="section-title">${L.skills}</div>
    <div class="skills-list">${skillsHtml}</div>
  </div>` : ''}

  ${(languages ?? []).length ? `
  <div class="section">
    <hr>
    <div class="section-title">${L.languages}</div>
    <div class="skills-list">${languagesHtml}</div>
  </div>` : ''}

  ${projects.length ? `
  <div class="section">
    <hr>
    <div class="section-title">${L.projects}</div>
    ${projectsHtml}
  </div>` : ''}
</body>
</html>`;
}
