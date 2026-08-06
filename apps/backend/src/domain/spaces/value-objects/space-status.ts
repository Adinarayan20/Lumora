export const SpaceStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
} as const;

export type SpaceStatus = (typeof SpaceStatus)[keyof typeof SpaceStatus];
