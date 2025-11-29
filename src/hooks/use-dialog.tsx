
import { useState, useCallback } from 'react';

export type DialogState = {
  isOpen: boolean;
  data?: any;
};

export type UseDialogReturn = {
  state: DialogState;
  open: (data?: any) => void;
  close: () => void;
};

export const useDialog = (initialState: boolean = false): UseDialogReturn => {
  const [state, setState] = useState<DialogState>({
    isOpen: initialState,
    data: undefined,
  });

  const open = useCallback((data?: any) => {
    setState({ isOpen: true, data });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { state, open, close };
};
