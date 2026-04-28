import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ResumeData } from '@resume-app/shared';
import { fetchResume } from '../api/resumeApi';
import ModernTemplate from '../components/templates/ModernTemplate';
import ClassicTemplate from '../components/templates/ClassicTemplate';
import MinimalTemplate from '../components/templates/MinimalTemplate';

function signalReady() {
  document.body.dataset.renderDone = 'true';
}

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    if (id) fetchResume(id).then(setResume);
  }, [id]);

  // Classic and Minimal use CSS-only layout — signal once fonts are loaded.
  // Modern signals itself via the onReady prop after JS pagination completes.
  useEffect(() => {
    if (!resume || resume.selectedTemplate === 'modern') return;
    document.fonts.ready.then(signalReady);
  }, [resume]);

  if (!resume) return null;

  return (
    <>
      <style>{`body { margin: 0 !important; padding: 0 !important; background: white; }`}</style>
      {resume.selectedTemplate === 'modern' && (
        <ModernTemplate resume={resume} onReady={signalReady} />
      )}
      {resume.selectedTemplate === 'classic' && (
        <ClassicTemplate resume={resume} />
      )}
      {resume.selectedTemplate === 'minimal' && (
        <MinimalTemplate resume={resume} />
      )}
    </>
  );
}
