export const CollectionType = {
  STATIC: 'STATIC',
  DYNAMIC: 'DYNAMIC',
} as const;

export type CollectionType =
  (typeof CollectionType)[keyof typeof CollectionType];

//
// CollectionStatus was removed — see cleanup report §12. Collection no
// longer has a lifecycle of its own; it either exists or is hard-deleted.
//
