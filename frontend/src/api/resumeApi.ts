import type { ResumeData, ResumeSummary, TemplateMetadata } from '@resume-app/shared';

const BASE = '/api';

export async function createResume(): Promise<string> {
  const res = await fetch(`${BASE}/resumes`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create resume');
  const { id } = await res.json();
  return id;
}

export async function fetchResume(id: string): Promise<ResumeData> {
  const res = await fetch(`${BASE}/resumes/${id}`);
  if (!res.ok) throw new Error('Resume not found');
  return res.json();
}

export async function saveResume(data: ResumeData): Promise<ResumeData> {
  const res = await fetch(`${BASE}/resumes/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save resume');
  return res.json();
}

export async function listResumes(): Promise<ResumeSummary[]> {
  const res = await fetch(`${BASE}/resumes`);
  if (!res.ok) throw new Error('Failed to list resumes');
  return res.json();
}

export async function fetchTemplates(): Promise<TemplateMetadata[]> {
  const res = await fetch(`${BASE}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function deleteResume(id: string): Promise<void> {
  const res = await fetch(`${BASE}/resumes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete resume');
}

export function getPdfUrl(id: string): string {
  return `${BASE}/resumes/${id}/pdf`;
}
