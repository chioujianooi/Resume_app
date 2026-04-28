import type { CoverLetterData, CoverLetterSummary } from '@resume-app/shared';

const BASE = '/api';

export async function createCoverLetter(resumeId: string): Promise<string> {
  const res = await fetch(`${BASE}/cover-letters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId }),
  });
  if (!res.ok) throw new Error('Failed to create cover letter');
  const { id } = await res.json();
  return id;
}

export async function fetchCoverLetter(id: string): Promise<CoverLetterData> {
  const res = await fetch(`${BASE}/cover-letters/${id}`);
  if (!res.ok) throw new Error('Cover letter not found');
  return res.json();
}

export async function saveCoverLetter(data: CoverLetterData): Promise<CoverLetterData> {
  const res = await fetch(`${BASE}/cover-letters/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save cover letter');
  return res.json();
}

export async function listCoverLetters(): Promise<CoverLetterSummary[]> {
  const res = await fetch(`${BASE}/cover-letters`);
  if (!res.ok) throw new Error('Failed to list cover letters');
  return res.json();
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const res = await fetch(`${BASE}/cover-letters/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete cover letter');
}

export function getCoverLetterPdfUrl(id: string): string {
  return `${BASE}/cover-letters/${id}/pdf`;
}
