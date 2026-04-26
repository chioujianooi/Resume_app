import { ResumeData } from '@resume-app/shared';
import { LABELS } from './labels';

export const MINIMAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10.5pt; color: #333; padding: 48px 56px; line-height: 1.6; }
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
  .bullets { margin-top: 5px; padding-left: 16px; list-style-type: disc; }
  .bullets li { font-size: 10pt; margin-bottom: 3px; color: #444; overflow-wrap: break-word; }
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-item { display: flex; align-items: center; gap: 6px; font-size: 9.5pt; color: #555; border: 1px solid #ddd; padding: 3px 10px; border-radius: 3px; }
  .skill-level { font-size: 8.5pt; color: #888; font-style: italic; }
  .project-tech { font-size: 9pt; color: #888; margin-top: 3px; }
  .summary { font-size: 10.5pt; color: #444; }
`;

function boldHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

const LEVEL_LABELS = ['', 'Basic', 'Familiar', 'Intermediate', 'Advanced', 'Expert'];

export function renderMinimal(data: ResumeData): string {
  const { contact, summary, experience, education, skills, projects } = data;
  const L = LABELS.minimal[data.language ?? 'en'];

  const contactSpans = [
    contact.email && `<span>${contact.email}</span>`,
    contact.phone && `<span>${contact.phone}</span>`,
    contact.location && `<span>${contact.location}</span>`,
    ...(contact.links ?? []).map(l =>
      `<span><a href="${l.url}" style="color:#666;text-decoration:none;">${l.label || l.url}</a></span>`
    ),
  ].filter(Boolean).join('');

  const experienceHtml = experience.map(e => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${e.title} — ${e.company}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      ${e.location ? `<div class="entry-subtitle">${e.location}</div>` : ''}
      ${e.bullets.length ? `<ul class="bullets">${e.bullets.map(b => `<li>${boldHtml(b)}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('');

  const educationHtml = education.map(e => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${e.institution}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      <div class="entry-subtitle">${e.degree} in ${e.field}${e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
    </div>
  `).join('');

  const skillsHtml = skills.map(s => `
    <span class="skill-item">
      ${s.name} · <span class="skill-level">${LEVEL_LABELS[s.level] ?? ''}</span>
    </span>
  `).join('');

  const projectsHtml = projects.map(p => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${p.name}</span>
        ${p.url ? `<a href="${p.url}" style="font-size:9pt;color:#888;">${p.url}</a>` : ''}
      </div>
      <div style="font-size:10pt;color:#444;">${p.description}</div>
      ${p.technologies.length ? `<div class="project-tech">${p.technologies.join(' · ')}</div>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${MINIMAL_CSS}</style>
</head>
<body>
  <div class="name">${contact.name}</div>
  <div class="contact-line">${contactSpans}</div>

  ${summary ? `
  <div class="section">
    <div class="section-title">${L.about}</div>
    <hr class="divider">
    <div class="summary">${summary}</div>
  </div>` : ''}

  ${experience.length ? `
  <div class="section">
    <div class="section-title">${L.experience}</div>
    <hr class="divider">
    ${experienceHtml}
  </div>` : ''}

  ${education.length ? `
  <div class="section">
    <div class="section-title">${L.education}</div>
    <hr class="divider">
    ${educationHtml}
  </div>` : ''}

  ${skills.length ? `
  <div class="section">
    <div class="section-title">${L.skills}</div>
    <hr class="divider">
    <div class="skills-wrap">${skillsHtml}</div>
  </div>` : ''}

  ${projects.length ? `
  <div class="section">
    <div class="section-title">${L.projects}</div>
    <hr class="divider">
    ${projectsHtml}
  </div>` : ''}
</body>
</html>`;
}
