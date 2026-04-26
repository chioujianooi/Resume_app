import { ResumeData } from '@resume-app/shared';

export const MODERN_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; font-size: 10.5pt; color: #2d2d2d; display: flex; min-height: 297mm; }
  .sidebar { width: 200px; min-width: 200px; background: #1e3a5f; color: #fff; padding: 32px 20px; }
  .main { flex: 1; min-width: 0; padding: 32px 32px 32px 28px; }
  .profile-photo { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto 16px; border: 3px solid #2e5a8a; }
  .sidebar .name { font-size: 16pt; font-weight: bold; line-height: 1.3; margin-bottom: 20px; word-break: break-word; }
  .sidebar-section { margin-bottom: 20px; }
  .sidebar-title { font-size: 9pt; text-transform: uppercase; letter-spacing: 1.5px; color: #a0c4e8; margin-bottom: 8px; border-bottom: 1px solid #2e5a8a; padding-bottom: 4px; }
  .sidebar-item { font-size: 9pt; margin-bottom: 5px; word-break: break-all; color: #dce8f5; }
  .skill-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .skill-name { font-size: 9pt; color: #dce8f5; }
  .skill-dots { display: flex; gap: 3px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .dot-filled { background: #a0c4e8; }
  .dot-empty { background: #2e5a8a; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 13pt; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; margin-bottom: 10px; }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: bold; font-size: 10.5pt; }
  .entry-subtitle { color: #555; font-size: 9.5pt; margin-top: 1px; }
  .entry-date { font-size: 9pt; color: #888; white-space: nowrap; }
  .bullets { margin-top: 4px; padding-left: 16px; list-style-type: disc; }
  .bullets li { font-size: 10pt; margin-bottom: 2px; overflow-wrap: break-word; }
  .project-tech { font-size: 9pt; color: #666; margin-top: 2px; }
`;

function dots(level: number): string {
  return [1, 2, 3, 4, 5].map(i =>
    `<span class="dot ${i <= level ? 'dot-filled' : 'dot-empty'}"></span>`
  ).join('');
}

export function renderModern(data: ResumeData): string {
  const { contact, summary, experience, education, skills, projects } = data;

  const sidebarContact = [
    contact.email && `<div class="sidebar-item">${contact.email}</div>`,
    contact.phone && `<div class="sidebar-item">${contact.phone}</div>`,
    contact.location && `<div class="sidebar-item">${contact.location}</div>`,
    contact.linkedin && `<div class="sidebar-item">${contact.linkedin}</div>`,
    contact.github && `<div class="sidebar-item">${contact.github}</div>`,
    contact.website && `<div class="sidebar-item">${contact.website}</div>`,
  ].filter(Boolean).join('');

  const skillsHtml = skills.map(s => `
    <div class="skill-row">
      <span class="skill-name">${s.name}</span>
      <div class="skill-dots">${dots(s.level)}</div>
    </div>
  `).join('');

  const experienceHtml = experience.map(e => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${e.title}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      <div class="entry-subtitle">${e.company}${e.location ? ` · ${e.location}` : ''}</div>
      ${e.bullets.length ? `<ul class="bullets">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
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

  const projectsHtml = projects.map(p => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${p.name}</span>
        ${p.url ? `<a href="${p.url}" style="font-size:9pt;color:#555;">${p.url}</a>` : ''}
      </div>
      <div style="font-size:10pt;">${p.description}</div>
      ${p.technologies.length ? `<div class="project-tech">Stack: ${p.technologies.join(', ')}</div>` : ''}
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${MODERN_CSS}</style>
</head>
<body>
  <div class="sidebar">
    ${contact.profilePhoto ? `<img src="${contact.profilePhoto}" alt="Profile" class="profile-photo">` : ''}
    <div class="name">${contact.name}</div>
    <div class="sidebar-section">
      <div class="sidebar-title">Contact</div>
      ${sidebarContact}
    </div>
    ${skills.length ? `
    <div class="sidebar-section">
      <div class="sidebar-title">Skills</div>
      ${skillsHtml}
    </div>` : ''}
  </div>

  <div class="main">
    ${summary ? `
    <div class="section">
      <div class="section-title">Profile</div>
      <div style="font-size:10.5pt;">${summary}</div>
    </div>` : ''}

    ${experience.length ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${experienceHtml}
    </div>` : ''}

    ${education.length ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${educationHtml}
    </div>` : ''}

    ${projects.length ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${projectsHtml}
    </div>` : ''}
  </div>
</body>
</html>`;
}
