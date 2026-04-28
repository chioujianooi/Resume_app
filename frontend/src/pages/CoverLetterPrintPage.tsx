import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { CoverLetterData } from '@resume-app/shared';
import { fetchCoverLetter } from '../api/coverLetterApi';
import CoverLetterTemplate from '../components/templates/CoverLetterTemplate';

function signalReady() {
  document.body.dataset.renderDone = 'true';
}

export default function CoverLetterPrintPage() {
  const { id } = useParams<{ id: string }>();
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);

  useEffect(() => {
    if (id) fetchCoverLetter(id).then(setCoverLetter);
  }, [id]);

  useEffect(() => {
    if (!coverLetter) return;
    document.fonts.ready.then(signalReady);
  }, [coverLetter]);

  if (!coverLetter) return null;

  return (
    <>
      <style>{`body { margin: 0 !important; padding: 0 !important; background: white; }`}</style>
      <CoverLetterTemplate coverLetter={coverLetter} />
    </>
  );
}
