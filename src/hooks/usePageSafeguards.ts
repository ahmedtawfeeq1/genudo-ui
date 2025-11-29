import { useEffect, useCallback, useRef } from 'react';

interface UsePageSafeguardsProps {
  isDirty?: boolean;
  formData?: any;
  autoSaveKey?: string;
  onAutoSave?: (data: any) => void;
  onDataRestore?: (data: any) => void;
  enableVisibilityProtection?: boolean;
}

/**
 * Enhanced hook that provides comprehensive safeguards against data loss
 * - Warns user before leaving page if there are unsaved changes
 * - Provides localStorage autosave functionality with auto-restore
 * - Handles beforeunload events
 * - Prevents unnecessary re-fetching on tab visibility changes
 */
export const usePageSafeguards = ({
  isDirty = false,
  formData,
  autoSaveKey,
  onAutoSave,
  onDataRestore,
  enableVisibilityProtection = true
}: UsePageSafeguardsProps = {}) => {
  
  const lastSaveRef = useRef<number>(0);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Auto-save to localStorage with throttling
  const autoSave = useCallback((data: any) => {
    if (autoSaveKey && data) {
      try {
        const now = Date.now();
        // Throttle auto-saves to every 2 seconds
        if (now - lastSaveRef.current > 2000) {
          localStorage.setItem(autoSaveKey, JSON.stringify({
            data,
            timestamp: now,
            version: '1.0'
          }));
          lastSaveRef.current = now;
          console.log(`Auto-saved form data for key: ${autoSaveKey}`);
        }
      } catch (error) {
        console.warn('Failed to auto-save to localStorage:', error);
      }
    }
  }, [autoSaveKey]);

  // Load from localStorage with validation
  const loadAutoSaved = useCallback(() => {
    if (!autoSaveKey) return null;
    
    try {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only return data that's less than 24 hours old and has valid structure
        if (parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < 86400000) {
          console.log(`Restored auto-saved data for key: ${autoSaveKey}`);
          return parsed.data;
        } else {
          // Clean up old data
          localStorage.removeItem(autoSaveKey);
        }
      }
    } catch (error) {
      console.warn('Failed to load auto-saved data:', error);
      // Clean up corrupted data
      if (autoSaveKey) {
        localStorage.removeItem(autoSaveKey);
      }
    }
    return null;
  }, [autoSaveKey]);

  // Clear auto-saved data
  const clearAutoSaved = useCallback(() => {
    if (autoSaveKey) {
      localStorage.removeItem(autoSaveKey);
      console.log(`Cleared auto-saved data for key: ${autoSaveKey}`);
    }
  }, [autoSaveKey]);

  // Auto-restore data on mount
  useEffect(() => {
    if (autoSaveKey && onDataRestore) {
      const savedData = loadAutoSaved();
      if (savedData) {
        onDataRestore(savedData);
      }
    }
  }, [autoSaveKey, onDataRestore, loadAutoSaved]);

  // Auto-save formData when it changes (with throttling)
  useEffect(() => {
    if (formData && isDirty) {
      // Clear any existing timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
      
      // Set a new timeout for auto-saving
      visibilityTimeoutRef.current = setTimeout(() => {
        autoSave(formData);
        if (onAutoSave) {
          onAutoSave(formData);
        }
      }, 1000); // Auto-save after 1 second of inactivity
    }
    
    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [formData, isDirty, autoSave, onAutoSave]);

  // Beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.preventDefault();
        event.returnValue = message;
        
        // Force auto-save before leaving
        if (formData) {
          autoSave(formData);
        }
        
        return message;
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isDirty, formData, autoSave]);

  // Enhanced visibility change handling
  useEffect(() => {
    if (!enableVisibilityProtection) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is being hidden - immediately auto-save if there are changes
        if (isDirty && formData) {
          console.log('Tab hidden - force saving data');
          autoSave(formData);
        }
      } else {
        // Tab is visible again - restore any saved data if needed
        console.log('Tab visible again');
        if (autoSaveKey && onDataRestore) {
          const savedData = loadAutoSaved();
          if (savedData && isDirty) {
            // Only restore if we have unsaved changes
            console.log('Restoring auto-saved data after tab switch');
            onDataRestore(savedData);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDirty, formData, autoSave, autoSaveKey, onDataRestore, loadAutoSaved, enableVisibilityProtection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, []);

  return {
    autoSave,
    loadAutoSaved,
    clearAutoSaved
  };
};