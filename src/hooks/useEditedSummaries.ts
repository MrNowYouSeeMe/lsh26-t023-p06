import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'client-digest-edited-summaries';

export function useEditedSummaries(datasetKey: string = 'default') {
  const [edits, setEdits] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
  }, [edits]);

  const makeKey = useCallback(
    (clientId: string) => `${datasetKey}::${clientId}`,
    [datasetKey],
  );

  const getSummary = useCallback(
    (clientId: string, generated: string) => edits[makeKey(clientId)] ?? generated,
    [edits, makeKey],
  );

  const setSummary = useCallback(
    (clientId: string, text: string) => {
      setEdits((prev) => ({ ...prev, [makeKey(clientId)]: text }));
    },
    [makeKey],
  );

  const resetSummary = useCallback(
    (clientId: string) => {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[makeKey(clientId)];
        return next;
      });
    },
    [makeKey],
  );

  const hasEdit = useCallback(
    (clientId: string) => makeKey(clientId) in edits,
    [edits, makeKey],
  );

  return { getSummary, setSummary, resetSummary, hasEdit };
}
