import { useEffect, useRef, useCallback } from 'react';

interface UseVisibilityAwareDataOptions {
  onVisible?: () => void;
  onHidden?: () => void;
  fetchOnVisible?: boolean;
  preventRefetchOnFocus?: boolean;
  minRefetchInterval?: number; // in milliseconds
}

/**
 * Hook that manages data fetching behavior based on tab visibility
 * Prevents unnecessary re-fetching when switching between tabs
 */
export const useVisibilityAwareData = (
  fetchData: () => Promise<void> | void,
  dependencies: any[] = [],
  options: UseVisibilityAwareDataOptions = {}
) => {
  const {
    onVisible,
    onHidden,
    fetchOnVisible = false,
    preventRefetchOnFocus = true,
    minRefetchInterval = 30000 // 30 seconds minimum between refetches
  } = options;

  const lastFetchTime = useRef<number>(0);
  const isVisible = useRef<boolean>(!document.hidden);
  const hasFetchedRef = useRef<boolean>(false);

  // Enhanced fetch function with timing controls
  const controlledFetch = useCallback(async () => {
    const now = Date.now();
    
    // Prevent too frequent refetches
    if (preventRefetchOnFocus && now - lastFetchTime.current < minRefetchInterval) {
      console.log('Skipping refetch - too soon since last fetch');
      return;
    }

    try {
      console.log('Fetching data due to visibility change or dependency update');
      await fetchData();
      lastFetchTime.current = now;
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [fetchData, preventRefetchOnFocus, minRefetchInterval]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isVisible.current;
      isVisible.current = !document.hidden;

      if (document.hidden) {
        // Tab is being hidden
        console.log('Tab hidden - pausing data operations');
        if (onHidden) {
          onHidden();
        }
      } else {
        // Tab is becoming visible
        console.log('Tab visible - resuming data operations');
        if (onVisible) {
          onVisible();
        }

        // Only fetch if explicitly requested and enough time has passed
        if (fetchOnVisible && (!preventRefetchOnFocus || !hasFetchedRef.current)) {
          controlledFetch();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [controlledFetch, onVisible, onHidden, fetchOnVisible, preventRefetchOnFocus]);

  // Handle dependency changes - only fetch if tab is visible
  useEffect(() => {
    if (isVisible.current) {
      controlledFetch();
    }
  }, dependencies);

  // Initial fetch if visible
  useEffect(() => {
    if (isVisible.current && !hasFetchedRef.current) {
      controlledFetch();
    }
  }, [controlledFetch]);

  return {
    isVisible: isVisible.current,
    lastFetchTime: lastFetchTime.current,
    forceFetch: controlledFetch
  };
};