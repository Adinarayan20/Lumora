export const CollectionType = {
  STATIC: 'STATIC',
  DYNAMIC: 'DYNAMIC',
} as const;

export type CollectionType = (typeof CollectionType)[keyof typeof CollectionType];

export const CollectionStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
} as const;

export type CollectionStatus = (typeof CollectionStatus)[keyof typeof CollectionStatus];
