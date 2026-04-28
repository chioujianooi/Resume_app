import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CoverLetterData } from '@resume-app/shared';
import {
  saveCoverLetter,
  loadCoverLetter,
  coverLetterExists,
  deleteCoverLetter,
  listCoverLetters,
} from '../services/coverLetterStorageService';
import { loadResume } from '../services/storageService';

export async function createCoverLetter(req: Request, res: Response): Promise<void> {
  const { resumeId } = req.body;
  if (!resumeId) {
    res.status(400).json({ error: 'resumeId is required' });
    return;
  }

  const resume = await loadResume(resumeId);
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }

  const top3Skills = [...resume.skills]
    .sort((a, b) => b.level - a.level)
    .slice(0, 3)
    .map(s => s.name)
    .join(', ');

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const skillsPhrase = top3Skills || 'my professional skills';
  const senderName = resume.contact.name || 'Applicant';

  const coverLetter: CoverLetterData = {
    id: uuidv4(),
    name: 'Untitled Cover Letter',
    resumeId,
    contact: { ...resume.contact },
    targetJob: '',
    targetCompany: '',
    date,
    opening: '<p>Dear Hiring Manager,</p>',
    body: `<p>I am writing to express my interest in this position. With my background in ${skillsPhrase}, I am confident I can make a meaningful contribution to your team.</p><p>I am excited about this opportunity and look forward to bringing my skills and dedication to your organization.</p>`,
    closing: `<p>Thank you for considering my application. I look forward to discussing how my experience aligns with your needs.</p><p>Sincerely,<br/>${senderName}</p>`,
    updatedAt: new Date().toISOString(),
  };

  await saveCoverLetter(coverLetter);
  res.status(201).json({ id: coverLetter.id });
}

export async function getCoverLetter(req: Request, res: Response): Promise<void> {
  const data = await loadCoverLetter(req.params.id);
  if (!data) {
    res.status(404).json({ error: 'Cover letter not found' });
    return;
  }
  res.json(data);
}

export async function getCoverLetters(_req: Request, res: Response): Promise<void> {
  const summaries = await listCoverLetters();
  res.json(summaries);
}

export async function updateCoverLetter(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const exists = await coverLetterExists(id);
  if (!exists) {
    res.status(404).json({ error: 'Cover letter not found' });
    return;
  }
  const updated: CoverLetterData = {
    ...req.body,
    id,
    updatedAt: new Date().toISOString(),
  };
  await saveCoverLetter(updated);
  res.json(updated);
}

export async function removeCoverLetter(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const exists = await coverLetterExists(id);
  if (!exists) {
    res.status(404).json({ error: 'Cover letter not found' });
    return;
  }
  await deleteCoverLetter(id);
  res.status(204).send();
}
