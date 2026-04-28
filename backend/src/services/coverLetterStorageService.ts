import fs from 'fs/promises';
import path from 'path';
import { CoverLetterData, CoverLetterSummary } from '@resume-app/shared';

const DATA_DIR = path.join(__dirname, '..', 'data', 'cover-letters');

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(id: string): string {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function saveCoverLetter(data: CoverLetterData): Promise<void> {
  await ensureDir();
  const tmp = filePath(data.id) + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, filePath(data.id));
}

export async function loadCoverLetter(id: string): Promise<CoverLetterData | null> {
  try {
    const raw = await fs.readFile(filePath(id), 'utf-8');
    return JSON.parse(raw) as CoverLetterData;
  } catch {
    return null;
  }
}

export async function coverLetterExists(id: string): Promise<boolean> {
  try {
    await fs.access(filePath(id));
    return true;
  } catch {
    return false;
  }
}

export async function deleteCoverLetter(id: string): Promise<void> {
  await fs.unlink(filePath(id));
}

export async function listCoverLetters(): Promise<CoverLetterSummary[]> {
  let files: string[];
  try {
    files = await fs.readdir(DATA_DIR);
  } catch {
    return [];
  }
  const summaries: CoverLetterSummary[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(raw) as CoverLetterData;
      summaries.push({
        id: data.id,
        name: data.name || 'Untitled Cover Letter',
        resumeId: data.resumeId,
        updatedAt: data.updatedAt,
      });
    } catch {
      // skip corrupted files
    }
  }
  summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return summaries;
}
