import { ResumeData } from '@resume-app/shared';
import { LABELS } from './labels';

export const MODERN_CSS = `
  @page { margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; padding: 0; }
  .page { display: flex; width: 794px; height: 1123px; overflow: hidden; }
  .sidebar { width: 200px; min-width: 200px; background: #1e3a5f; color: #fff; padding: 32px 20px; overflow: hidden; }
  .main { flex: 1; min-width: 0; padding: 40px 32px 40px 28px; overflow: hidden; }
  .profile-photo { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto 16px; border: 3px solid #2e5a8a; }
  .sidebar .name { font-size: 16pt; font-weight: bold; line-height: 1.3; margin-bottom: 20px; word-break: break-word; }
  .sidebar-section { margin-bottom: 20px; }
  .sidebar-title { font-size: 9pt; text-transform: uppercase; letter-spacing: 1.5px; color: #a0c4e8; margin-bottom: 8px; border-bottom: 1px solid #2e5a8a; padding-bottom: 4px; }
  .sidebar-item { font-size: 9pt; margin-bottom: 5px; word-break: break-all; color: #dce8f5; }
  .skill-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .skill-name { font-size: 9pt; color: #dce8f5; }
  .skill-level { font-size: 9pt; color: #a0c4e8; font-style: italic; }
  .section { margin-bottom: 20px; }
  .section-title { font-family: 'Arial', sans-serif; font-size: 10.5pt; color: #2d2d2d; font-size: 15pt; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; margin-bottom: 10px; }
  .entry { margin-bottom: 20px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: bold; font-size: 12pt; }
  .entry-subtitle { color: #555; font-size: 9.5pt; margin-top: 1px; }
  .entry-date { font-size: 9pt; color: #888; white-space: nowrap; }
  .entry-body { margin-top: 4px; font-size: 10pt; }
  .entry-body ul { padding-left: 20px; list-style-type: disc; margin: 2px 0; }
  .entry-body ol { padding-left: 20px; list-style-type: decimal; margin: 2px 0; }
  .entry-body li { margin-bottom: 2px; overflow-wrap: break-word; }
  .entry-body p, .entry-body div { margin: 1px 0; }
  .project-tech { font-size: 9pt; color: #666; margin-top: 2px; }
`;

const LEVEL_LABELS = ['', 'Basic', 'Familiar', 'Intermediate', 'Advanced', 'Expert'];
const LANG_LEVEL_LABELS = ['', 'Basic', 'Conversational', 'Intermediate', 'Advanced', 'Native'];

type Labels = { readonly [K in keyof typeof LABELS.modern['en']]: string };

function buildSidebarInner(data: ResumeData, L: Labels): string {
  // Just build the inner HTML — the .sidebar wrapper is added per page by the script
  const { contact, skills, languages } = data;
  const photo = contact.profilePhoto
    ? `<img src="${contact.profilePhoto}" alt="Profile" class="profile-photo">`
    : '';
  const contactItems = [
    contact.email && `<div class="sidebar-item">${contact.email}</div>`,
    contact.phone && `<div class="sidebar-item">${contact.phone}</div>`,
    contact.location && `<div class="sidebar-item">${contact.location}</div>`,
  ].filter(Boolean).join('');
  const linksSection = (contact.links ?? []).length
    ? `<div class="sidebar-section">
        <div class="sidebar-title">${L.links}</div>
        ${(contact.links ?? []).map(l => `<div class="sidebar-item"><a href="${l.url}" style="color:#a0c4e8;text-decoration:none;word-break:break-all;">${l.label || l.url}</a></div>`).join('')}
       </div>`
    : '';
  const skillsSection = skills.length
    ? `<div class="sidebar-section">
        <div class="sidebar-title">${L.skills}</div>
        ${skills.map(s => `<div class="skill-row"><span class="skill-name">${s.name}</span><span class="skill-level">${LEVEL_LABELS[s.level] ?? ''}</span></div>`).join('')}
       </div>`
    : '';
  const langsSection = (languages ?? []).length
    ? `<div class="sidebar-section">
        <div class="sidebar-title">${L.languages}</div>
        ${(languages ?? []).map(l => `<div class="skill-row"><span class="skill-name">${l.name}</span><span class="skill-level">${LANG_LEVEL_LABELS[l.level] ?? ''}</span></div>`).join('')}
       </div>`
    : '';
  return `${photo}
    <div class="name">${contact.name || ''}</div>
    <div class="sidebar-section">
      <div class="sidebar-title">${L.contact}</div>
      ${contactItems}
    </div>
    ${linksSection}
    ${skillsSection}
    ${langsSection}`;
}

function buildBlocksHtml(data: ResumeData, L: Labels): string[] {
  const { summary, experience, education, projects } = data;
  const blocks: string[] = [];

  if (summary) {
    blocks.push(
      `<div data-block class="section">
        <div class="section-title">${L.profile}</div>
        <div style="font-size:10.5pt;font-family:'Arial',sans-serif;color:#2d2d2d;">${summary}</div>
       </div>`
    );
  }

  experience.forEach((e, i) => {
    const body = `<div class="entry-body">${e.description || `<ul>${(e.bullets ?? []).map(b => `<li>${b}</li>`).join('')}</ul>`}</div>`;
    const entryInner = `
      <div class="entry-header">
        <span class="entry-title">${e.title}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      <div class="entry-subtitle">${e.company}${e.location ? ` · ${e.location}` : ''}</div>
      ${(e.description || (e.bullets?.length ?? 0) > 0) ? body : ''}`;
    if (i === 0) {
      blocks.push(
        `<div data-block>
          <div class="section-title">${L.experience}</div>
          <div class="entry">${entryInner}</div>
         </div>`
      );
    } else {
      blocks.push(`<div data-block class="entry">${entryInner}</div>`);
    }
  });

  education.forEach((e, i) => {
    const entryInner = `
      <div class="entry-header">
        <span class="entry-title">${e.institution}</span>
        <span class="entry-date">${e.startDate} – ${e.endDate}</span>
      </div>
      <div class="entry-subtitle">${e.degree} in ${e.field}${e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>`;
    if (i === 0) {
      blocks.push(
        `<div data-block>
          <div class="section-title">${L.education}</div>
          <div class="entry">${entryInner}</div>
         </div>`
      );
    } else {
      blocks.push(`<div data-block class="entry">${entryInner}</div>`);
    }
  });

  projects.forEach((p, i) => {
    const entryInner = `
      <div class="entry-header">
        <span class="entry-title">${p.name}</span>
        ${p.url ? `<a href="${p.url}" style="font-size:9pt;color:#555;">${p.url}</a>` : ''}
      </div>
      <div style="font-size:10pt;">${p.description}</div>
      ${p.technologies.length ? `<div class="project-tech">${L.stack} ${p.technologies.join(', ')}</div>` : ''}`;
    if (i === 0) {
      blocks.push(
        `<div data-block>
          <div class="section-title">${L.projects}</div>
          <div class="entry">${entryInner}</div>
         </div>`
      );
    } else {
      blocks.push(`<div data-block class="entry">${entryInner}</div>`);
    }
  });

  return blocks;
}

export function renderModern(data: ResumeData): string {
  const L = LABELS.modern[data.language ?? 'en'];
  const sidebarInner = buildSidebarInner(data, L as any);
  const blocks = buildBlocksHtml(data, L);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${MODERN_CSS}
    /* Measurement container — off-screen, correct content width */
    #measure-container {
      position: fixed; top: 0; left: -9999px;
      visibility: hidden; pointer-events: none;
      width: 534px;
      font-family: 'Arial', sans-serif; font-size: 10.5pt; color: #2d2d2d;
    }
  </style>
</head>
<body data-needs-pagination="true">

  <!-- All main-column blocks rendered here for measurement -->
  <div id="measure-container">
    ${blocks.join('\n    ')}
  </div>

  <!-- Sidebar inner HTML cloned into every page by the script -->
  <div id="sidebar-tpl" style="display:none">
    ${sidebarInner}
  </div>

  <script>
    (async function () {
      const USABLE_HEIGHT = 1043; // 1123 - 40 top - 40 bottom padding

      await document.fonts.ready;

      const blocks = [...document.querySelectorAll('#measure-container [data-block]')];
      const sidebarInnerHtml = document.getElementById('sidebar-tpl').innerHTML;

      // Measure block heights using top-delta to capture inter-block spacing
      const rects = blocks.map(function(el) { return el.getBoundingClientRect(); });
      const heights = rects.map(function(r, i) {
        return i < rects.length - 1 ? rects[i + 1].top - r.top : r.height;
      });

      // Assign each block to a page
      const assignments = [];
      var page = 0, h = 0;
      heights.forEach(function(bh, i) {
        if (i > 0 && h + bh > USABLE_HEIGHT) { page++; h = 0; }
        assignments.push(page);
        h += bh;
      });
      var numPages = blocks.length > 0 ? page + 1 : 1;

      // Clear body and rebuild as paginated .page divs
      document.body.innerHTML = '';

      for (var p = 0; p < numPages; p++) {
        var pageDiv = document.createElement('div');
        pageDiv.className = 'page';

        var sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        if (p === 0) sidebar.innerHTML = sidebarInnerHtml;
        pageDiv.appendChild(sidebar);

        var main = document.createElement('div');
        main.className = 'main';
        blocks.forEach(function(bl, i) {
          if (assignments[i] === p) main.appendChild(bl);
        });
        pageDiv.appendChild(main);

        document.body.appendChild(pageDiv);
      }

      document.body.dataset.paginationDone = 'true';
    })();
  </script>
</body>
</html>`;
}
