import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ToastDimensions, SpacingScale } from '@lumora/theme';
import type { ToastOptions, ToastItem, ToastContextValue, ToastProviderProps } from './Toast.types';
import { ToastBanner } from './Toast';

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const hideToast = useCallback((id: string) => {
    // Clear active timer for this toast if present
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = options.durationMs !== undefined ? options.durationMs : ToastDimensions.toastAutoDismissMs;

    // Clear any previous timer if toast with same ID is being replaced
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }

    const newItem: ToastItem = {
      ...options,
      id,
      durationMs: duration,
    };

    setToasts((prev) => [...prev.filter((t) => t.id !== id), newItem]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        hideToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [hideToast]);

  // Clean up all active timers on provider unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Floating Toast Layer */}
      {toasts.length > 0 ? (
        <View style={styles.toastContainer} pointerEvents="box-none">
          {toasts.map((toast) => (
            <ToastBanner
              key={toast.id}
              toast={toast}
              onDismiss={() => hideToast(toast.id)}
            />
          ))}
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: SpacingScale.lg,
    left: SpacingScale.md,
    right: SpacingScale.md,
    alignItems: 'center',
    zIndex: ToastDimensions.toastZIndex,
  },
});
