import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ResumeData } from '@resume-app/shared';
import { saveResume, loadResume, listResumes, deleteResume } from '../services/storageService';

function emptyResume(id: string): ResumeData {
  return {
    id,
    name: '',
    contact: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    selectedTemplate: 'classic',
    language: 'en',
    updatedAt: new Date().toISOString(),
  };
}

export async function createResume(req: Request, res: Response): Promise<void> {
  const id = uuidv4();
  const resume = emptyResume(id);
  await saveResume(resume);
  res.status(201).json({ id });
}

export async function getResume(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const resume = await loadResume(id);
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }
  res.json(resume);
}

export async function getResumes(_req: Request, res: Response): Promise<void> {
  const summaries = await listResumes();
  res.json(summaries);
}

export async function removeResume(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await loadResume(id);
  if (!existing) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }
  await deleteResume(id);
  res.status(204).send();
}

export async function updateResume(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const existing = await loadResume(id);
  if (!existing) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }
  const updated: ResumeData = { ...req.body as ResumeData, id, updatedAt: new Date().toISOString() };
  await saveResume(updated);
  res.json(updated);
}
