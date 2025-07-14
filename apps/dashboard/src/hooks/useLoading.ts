import { useState, useCallback, useEffect, useRef } from 'react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface UseStatusOptions {
  autoResetDelay?: number;
}

export function useLoading(
  initialState: ButtonState = 'idle',
  options?: UseStatusOptions,
) {
  const { autoResetDelay = 2000 } = options || {};
  const [status, setStatus] = useState<ButtonState>(initialState);
  const callbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timeout = setTimeout(() => {
        if (callbackRef.current) {
          callbackRef.current();
          callbackRef.current = null;
        } else if (status === 'error' || status === 'success') {
          setStatus('idle');
        }
      }, autoResetDelay);
      return () => clearTimeout(timeout);
    }
  }, [status, autoResetDelay]);

  const setSuccess = useCallback((callback?: () => void) => {
    if (callback) callbackRef.current = callback;
    setStatus('success');
  }, []);

  const setError = useCallback((callback?: () => void) => {
    if (callback) callbackRef.current = callback;
    setStatus('error');
  }, []);

  const setLoading = useCallback(() => {
    callbackRef.current = null;
    setStatus('loading');
  }, []);

  const setIdle = useCallback(() => {
    callbackRef.current = null;
    setStatus('idle');
  }, []);

  return { status, setSuccess, setError, setLoading, setIdle };
}
