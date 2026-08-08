import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ToastDimensions, SpacingScale } from '@lumora/theme';
import type { ToastOptions, ToastItem, ToastContextValue, ToastProviderProps } from './Toast.types';
import { ToastBanner } from './Toast';

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.durationMs !== undefined ? options.durationMs : ToastDimensions.toastAutoDismissMs;

    const newItem: ToastItem = {
      ...options,
      id,
      durationMs: duration,
    };

    setToasts((prev) => [...prev.filter((t) => t.id !== id), newItem]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, [hideToast]);

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
