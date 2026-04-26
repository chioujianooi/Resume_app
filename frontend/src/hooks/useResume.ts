import { useState, useEffect, useRef, useCallback } from 'react';
import type { ResumeData, ResumeSummary } from '@resume-app/shared';
import { createResume, fetchResume, saveResume, listResumes, deleteResume } from '../api/resumeApi';

const STORAGE_KEY = 'resume_app_id';

export function useResume() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [resumeList, setResumeList] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadAndSetResume(id: string): Promise<ResumeData> {
    const data = await fetchResume(id);
    setResume(data);
    localStorage.setItem(STORAGE_KEY, id);
    return data;
  }

  async function refreshList() {
    const summaries = await listResumes();
    setResumeList(summaries);
  }

  useEffect(() => {
    async function init() {
      try {
        let id = localStorage.getItem(STORAGE_KEY);
        if (!id) {
          id = await createResume();
        }
        await loadAndSetResume(id);
        await refreshList();
      } catch (err) {
        try {
          const id = await createResume();
          await loadAndSetResume(id);
          await refreshList();
        } catch {
          setError('Could not connect to backend. Make sure the server is running.');
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const updateResume = useCallback((updated: ResumeData) => {
    setResume(updated);
    setResumeList(prev =>
      prev.map(s => s.id === updated.id ? { ...s, name: updated.name || 'Untitled Resume' } : s)
    );
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const saved = await saveResume(updated);
        setResumeList(prev =>
          prev.map(s => s.id === saved.id ? { ...s, name: saved.name || 'Untitled Resume', updatedAt: saved.updatedAt } : s)
        );
      } catch {
        // silent — user can still work, will retry on next change
      } finally {
        setSaving(false);
      }
    }, 500);
  }, []);

  const renameResume = useCallback((name: string) => {
    setResume(prev => {
      if (!prev) return prev;
      const updated = { ...prev, name };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const saved = await saveResume(updated);
          setResumeList(prev =>
            prev.map(s => s.id === saved.id ? { ...s, name: saved.name || 'Untitled Resume', updatedAt: saved.updatedAt } : s)
          );
        } catch {
          // silent
        } finally {
          setSaving(false);
        }
      }, 500);
      return updated;
    });
    setResumeList(prev =>
      prev.map(s => s.id === localStorage.getItem(STORAGE_KEY) ? { ...s, name: name || 'Untitled Resume' } : s)
    );
  }, []);

  const switchResume = useCallback(async (id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const data = await fetchResume(id);
    setResume(data);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const createNewResume = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const id = await createResume();
    await loadAndSetResume(id);
    await refreshList();
  }, []);

  const removeResume = useCallback(async (id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await deleteResume(id);
    const remaining = await listResumes();
    setResumeList(remaining);
    if (id === localStorage.getItem(STORAGE_KEY)) {
      if (remaining.length > 0) {
        await loadAndSetResume(remaining[0].id);
      } else {
        const newId = await createResume();
        await loadAndSetResume(newId);
        await refreshList();
      }
    }
  }, []);

  const duplicateResume = useCallback(async (id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const source = await fetchResume(id);
    const newId = await createResume();
    const copy = { ...source, id: newId, name: `Copy of ${source.name || 'Untitled Resume'}` };
    await saveResume(copy);
    await loadAndSetResume(newId);
    await refreshList();
  }, []);

  return { resume, loading, saving, error, updateResume, renameResume, resumeList, switchResume, createNewResume, duplicateResume, removeResume };
}
