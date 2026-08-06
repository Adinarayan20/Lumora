export const ObjectStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
} as const;

export type ObjectStatus = (typeof ObjectStatus)[keyof typeof ObjectStatus];
