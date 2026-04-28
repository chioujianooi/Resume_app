import { useState, useEffect, useRef, useCallback } from 'react';
import type { CoverLetterData, CoverLetterSummary } from '@resume-app/shared';
import {
  fetchCoverLetter,
  saveCoverLetter,
  listCoverLetters,
  deleteCoverLetter,
} from '../api/coverLetterApi';

const STORAGE_KEY = 'resume_app_cover_letter_id';

export function useCoverLetter(initialId?: string) {
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [coverLetterList, setCoverLetterList] = useState<CoverLetterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadAndSet(id: string): Promise<CoverLetterData> {
    const data = await fetchCoverLetter(id);
    setCoverLetter(data);
    localStorage.setItem(STORAGE_KEY, id);
    return data;
  }

  async function refreshList() {
    const summaries = await listCoverLetters();
    setCoverLetterList(summaries);
  }

  useEffect(() => {
    async function init() {
      try {
        await refreshList();
        const id = initialId ?? localStorage.getItem(STORAGE_KEY);
        if (id) {
          try {
            await loadAndSet(id);
          } catch {
            // stored ID is stale; clear it and show null state
            localStorage.removeItem(STORAGE_KEY);
            setCoverLetter(null);
          }
        } else {
          setCoverLetter(null);
        }
      } catch {
        setError('Could not connect to backend. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    }
    init();
    // initialId intentionally only used on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCoverLetter = useCallback((updated: CoverLetterData) => {
    setCoverLetter(updated);
    setCoverLetterList(prev =>
      prev.map(s => s.id === updated.id ? { ...s, name: updated.name || 'Untitled Cover Letter' } : s)
    );
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const saved = await saveCoverLetter(updated);
        setCoverLetterList(prev =>
          prev.map(s => s.id === saved.id
            ? { ...s, name: saved.name || 'Untitled Cover Letter', updatedAt: saved.updatedAt }
            : s
          )
        );
      } catch {
        // silent — user can still work, will retry on next change
      } finally {
        setSaving(false);
      }
    }, 500);
  }, []);

  const switchCoverLetter = useCallback(async (id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const [data, summaries] = await Promise.all([fetchCoverLetter(id), listCoverLetters()]);
    setCoverLetter(data);
    setCoverLetterList(summaries);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const removeCoverLetter = useCallback(async (id: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await deleteCoverLetter(id);
    const remaining = await listCoverLetters();
    setCoverLetterList(remaining);
    if (id === localStorage.getItem(STORAGE_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      if (remaining.length > 0) {
        await loadAndSet(remaining[0].id);
      } else {
        setCoverLetter(null);
      }
    }
  }, []);

  return {
    coverLetter,
    coverLetterList,
    loading,
    saving,
    error,
    updateCoverLetter,
    switchCoverLetter,
    removeCoverLetter,
  };
}
