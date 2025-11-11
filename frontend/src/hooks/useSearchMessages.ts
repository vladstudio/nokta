import { useState, useEffect, useCallback, useRef } from 'react';
import { messages as messagesAPI } from '../services/pocketbase';
import type { Message } from '../types';

export function useSearchMessages(chatId: string, query: string) {
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    // Cancel previous request
    abortControllerRef.current?.abort();

    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await messagesAPI.search(chatId, searchQuery);
      if (!controller.signal.aborted) {
        setResults(response.items);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Search failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      setError(errorMessage);
      setResults([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [chatId]);

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { results, loading, error };
}
