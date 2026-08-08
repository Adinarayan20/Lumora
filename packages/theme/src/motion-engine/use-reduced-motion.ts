import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * useReducedMotion — Shared Reduced-Motion State Hook
 *
 * Checks AccessibilityInfo.isReduceMotionEnabled() and listens to reduceMotionChanged updates
 * with clean listener unmount cleanup.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        // Fallback to false if unsupported by platform environment
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      },
    );

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  return reduceMotion;
}
