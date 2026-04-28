import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { ResumeData } from '@resume-app/shared';
import { LABELS } from '../../utils/templateLabels';

// Main column content width: (794 sidebar+main) - 200 sidebar - 28 left pad - 32 right pad
const CONTENT_WIDTH = 534;
// Usable vertical space per page: 1123 A4 - 40 top pad - 40 bottom pad
const USABLE_HEIGHT = 1043;

const CSS = `
  @page { margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .resume-modern { font-family: 'Arial', 'Liberation Sans', sans-serif; font-size: 10.5pt; color: #2d2d2d; display: flex; width: 794px; height: 1123px; overflow: hidden; }
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
  .section-title { font-size: 15pt; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; margin-bottom: 10px; }
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

function buildSidebar(resume: ResumeData): ReactNode {
  const { contact, skills, languages } = resume;
  const L = LABELS.modern[resume.language ?? 'en'];
  return (
    <div className="sidebar">
      {contact.profilePhoto && (
        <img src={contact.profilePhoto} alt="Profile" className="profile-photo" />
      )}
      <div className="name">{contact.name || 'Your Name'}</div>
      <div className="sidebar-section">
        <div className="sidebar-title">{L.contact}</div>
        {contact.email && <div className="sidebar-item">{contact.email}</div>}
        {contact.phone && <div className="sidebar-item">{contact.phone}</div>}
        {contact.location && <div className="sidebar-item">{contact.location}</div>}
      </div>
      {(contact.links ?? []).length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-title">{L.links}</div>
          {(contact.links ?? []).map((link, i) => (
            <div key={i} className="sidebar-item">
              <a href={link.url} style={{ color: '#a0c4e8', textDecoration: 'none', wordBreak: 'break-all' }}>
                {link.label || link.url}
              </a>
            </div>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-title">{L.skills}</div>
          {skills.map(s => (
            <div key={s.name} className="skill-row">
              <span className="skill-name">{s.name}</span>
              <span className="skill-level">{LEVEL_LABELS[s.level] ?? ''}</span>
            </div>
          ))}
        </div>
      )}
      {(languages ?? []).length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-title">{L.languages}</div>
          {(languages ?? []).map(l => (
            <div key={l.name} className="skill-row">
              <span className="skill-name">{l.name}</span>
              <span className="skill-level">{LANG_LEVEL_LABELS[l.level] ?? ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildBlocks(resume: ResumeData): ReactNode[] {
  const { summary, experience, education, projects } = resume;
  const L = LABELS.modern[resume.language ?? 'en'];
  const blocks: ReactNode[] = [];

  if (summary) {
    blocks.push(
      <div key="summary" className="section">
        <div className="section-title">{L.profile}</div>
        <div style={{ fontSize: '10.5pt' }} dangerouslySetInnerHTML={{ __html: summary }} />
      </div>
    );
  }

  experience.forEach((e, i) => {
    const body = (
      <>
        <div className="entry-header">
          <span className="entry-title">{e.title}</span>
          <span className="entry-date">{e.startDate} – {e.endDate}</span>
        </div>
        <div className="entry-subtitle">{e.company}{e.location ? ` · ${e.location}` : ''}</div>
        {(e.description || (e.bullets?.length ?? 0) > 0) && (
          <div className="entry-body" dangerouslySetInnerHTML={{ __html: e.description || `<ul>${(e.bullets ?? []).map(b => `<li>${b}</li>`).join('')}</ul>` }} />
        )}
      </>
    );
    if (i === 0) {
      blocks.push(
        <div key={`exp-${e.id}`}>
          <div className="section-title">{L.experience}</div>
          <div className="entry">{body}</div>
        </div>
      );
    } else {
      blocks.push(<div key={`exp-${e.id}`} className="entry">{body}</div>);
    }
  });

  education.forEach((e, i) => {
    const body = (
      <>
        <div className="entry-header">
          <span className="entry-title">{e.institution}</span>
          <span className="entry-date">{e.startDate} – {e.endDate}</span>
        </div>
        <div className="entry-subtitle">{e.degree} in {e.field}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
      </>
    );
    if (i === 0) {
      blocks.push(
        <div key={`edu-${e.id}`}>
          <div className="section-title">{L.education}</div>
          <div className="entry">{body}</div>
        </div>
      );
    } else {
      blocks.push(<div key={`edu-${e.id}`} className="entry">{body}</div>);
    }
  });

  projects.forEach((p, i) => {
    const body = (
      <>
        <div className="entry-header">
          <span className="entry-title">{p.name}</span>
          {p.url && <span style={{ fontSize: '9pt', color: '#555' }}>{p.url}</span>}
        </div>
        <div style={{ fontSize: '10pt' }}>{p.description}</div>
        {p.technologies.length > 0 && <div className="project-tech">{L.stack} {p.technologies.join(', ')}</div>}
      </>
    );
    if (i === 0) {
      blocks.push(
        <div key={`proj-${p.id}`}>
          <div className="section-title">{L.projects}</div>
          <div className="entry">{body}</div>
        </div>
      );
    } else {
      blocks.push(<div key={`proj-${p.id}`} className="entry">{body}</div>);
    }
  });

  return blocks;
}

export default function ModernTemplate({ resume, onReady }: { resume: ResumeData; onReady?: () => void }) {
  const [pages, setPages] = useState<ReactNode[][] | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const allBlocks = buildBlocks(resume);
  const sidebar = buildSidebar(resume);

  useLayoutEffect(() => {
    let cancelled = false;

    async function run() {
      await document.fonts.ready;
      if (cancelled || !measureRef.current) return;

      const children = Array.from(measureRef.current.children) as HTMLElement[];
      if (children.length === 0) {
        if (!cancelled) setPages([[]]);
        return;
      }

      const rects = children.map(el => el.getBoundingClientRect());
      // Use top-delta between consecutive blocks to capture inter-block spacing naturally.
      // Last block uses its own height since there's no following sibling.
      const heights = rects.map((r, i) =>
        i < rects.length - 1 ? rects[i + 1].top - r.top : r.height
      );

      const result: ReactNode[][] = [[]];
      let h = 0;
      allBlocks.forEach((block, i) => {
        if (i > 0 && h + heights[i] > USABLE_HEIGHT) {
          result.push([]);
          h = 0;
        }
        result[result.length - 1].push(block);
        h += heights[i];
      });

      if (!cancelled) setPages(result);
    }

    setPages(null);
    run();
    return () => { cancelled = true; };
  }, [resume]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect (not useLayoutEffect) fires after the browser paints, so Puppeteer
  // reads the DOM only once all paginated pages are visible.
  useEffect(() => {
    if (pages !== null) onReady?.();
  }, [pages]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{CSS}</style>

      {/* Hidden container used only for measuring block heights at the correct content width */}
      <div
        ref={measureRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          visibility: 'hidden',
          width: `${CONTENT_WIDTH}px`,
          pointerEvents: 'none',
        }}
      >
        {allBlocks}
      </div>

      {pages === null
        ? <div style={{ width: '794px', height: '1123px' }} />
        : pages.map((pageBlocks, i) => (
          <div key={i} className="resume-modern">
            {i === 0 ? sidebar : <div className="sidebar" />}
            <div className="main">{pageBlocks}</div>
          </div>
        ))
      }
    </>
  );
}
