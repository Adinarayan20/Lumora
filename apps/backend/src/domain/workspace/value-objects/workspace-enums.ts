export const WorkspaceType = {
  PERSONAL: 'PERSONAL',
  CUSTOM: 'CUSTOM',
  FAMILY: 'FAMILY',
  TEAM: 'TEAM',
  BUSINESS: 'BUSINESS',
} as const;

export type WorkspaceType = (typeof WorkspaceType)[keyof typeof WorkspaceType];

export const WorkspaceVisibility = {
  PRIVATE: 'PRIVATE',
  INTERNAL: 'INTERNAL',
  PUBLIC: 'PUBLIC',
} as const;

export type WorkspaceVisibility =
  (typeof WorkspaceVisibility)[keyof typeof WorkspaceVisibility];

export const WorkspaceStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
  DELETED: 'DELETED',
} as const;

export type WorkspaceStatus =
  (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus];

export const WorkspacePlan = {
  FREE: 'FREE',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type WorkspacePlan = (typeof WorkspacePlan)[keyof typeof WorkspacePlan];
