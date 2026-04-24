import fs from 'fs/promises';
import path from 'path';
import { ResumeData } from '@resume-app/shared';

const DATA_DIR = path.join(__dirname, '..', 'data', 'resumes');

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function saveResume(data: ResumeData): Promise<void> {
  await ensureDir();
  const tmp = filePath(data.id) + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, filePath(data.id));
}

export async function loadResume(id: string): Promise<ResumeData | null> {
  try {
    const raw = await fs.readFile(filePath(id), 'utf-8');
    return JSON.parse(raw) as ResumeData;
  } catch {
    return null;
  }
}

export async function resumeExists(id: string): Promise<boolean> {
  try {
    await fs.access(filePath(id));
    return true;
  } catch {
    return false;
  }
}
