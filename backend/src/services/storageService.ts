import fs from 'fs/promises';
import path from 'path';
import { ResumeData, ResumeSummary } from '@resume-app/shared';

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

export async function listResumes(): Promise<ResumeSummary[]> {
  let files: string[];
  try {
    files = await fs.readdir(DATA_DIR);
  } catch {
    return [];
  }
  const summaries: ResumeSummary[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(raw) as ResumeData;
      summaries.push({
        id: data.id,
        name: data.name || 'Untitled Resume',
        updatedAt: data.updatedAt,
      });
    } catch {
      // skip corrupted files
    }
  }
  summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return summaries;
}
