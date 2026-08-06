/**
 * Constant behavior extension keys supported by Lumora object entities.
 */
export const BehaviorExtensionKey = {
  REMINDER: 'REMINDER',
  TIMELINE: 'TIMELINE',
  MEDIA: 'MEDIA',
} as const;

export type BehaviorExtensionKey = (typeof BehaviorExtensionKey)[keyof typeof BehaviorExtensionKey];
