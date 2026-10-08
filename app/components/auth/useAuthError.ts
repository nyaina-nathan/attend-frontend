"use client";

import { useCallback, useState } from "react";

export interface AuthError {
  message: string;
  /** Changes on every `showError`, so the dismiss timer restarts each time. */
  nonce: number;
}

/**
 * Small error state shared by the auth forms. `showError` always produces a new
 * nonce so an identical message shown twice still restarts the auto-dismiss.
 */
export function useAuthError() {
  const [error, setError] = useState<AuthError | null>(null);

  const showError = useCallback((message: string) => {
    setError({ message, nonce: Date.now() });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, showError, clearError };
}
