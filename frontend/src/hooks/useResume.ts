import { useState, useEffect, useRef, useCallback } from 'react';
import type { ResumeData } from '@resume-app/shared';
import { createResume, fetchResume, saveResume } from '../api/resumeApi';

const STORAGE_KEY = 'resume_app_id';

export function useResume() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function init() {
      try {
        let id = localStorage.getItem(STORAGE_KEY);
        if (!id) {
          id = await createResume();
          localStorage.setItem(STORAGE_KEY, id);
        }
        const data = await fetchResume(id);
        setResume(data);
      } catch (err) {
        // If stored id is stale, create a fresh one
        try {
          const id = await createResume();
          localStorage.setItem(STORAGE_KEY, id);
          const data = await fetchResume(id);
          setResume(data);
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveResume(updated);
      } catch {
        // silent — user can still work, will retry on next change
      } finally {
        setSaving(false);
      }
    }, 500);
  }, []);

  return { resume, loading, saving, error, updateResume };
}
