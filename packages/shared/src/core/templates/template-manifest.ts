import type { PublisherTrustLevel } from "./publisher-trust-level.js";
import type { TemplateCategory } from "./template-category.js";

export interface CapabilityRequirement {
  key: string;
  versionConstraint: string; // e.g. ">=1.0.0", "^2.0.0"
  optional?: boolean;
}

export interface TemplatePermissions {
  requiredPermissions: string[];
  optionalPermissions?: string[];
  dangerousPermissions?: string[];
}

export interface TemplateDependency {
  templateKey: string;
  versionConstraint: string; // SemVer range e.g. "^1.0.0"
}

export interface TemplateAuthor {
  name: string;
  publisherId: string;
  publisherUuid?: string;
  url?: string;
  trustLevel: PublisherTrustLevel;
}

export interface TemplateSignature {
  hash: string;
  publicKeyId: string;
  signedAt: string;
}

export interface TemplateManifest {
  id: string;
  packageUuid: string;
  publisherUuid: string;
  packageHash: string;
  key: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  minPlatformVersion: string;
  author: TemplateAuthor;
  license: string;
  signature?: TemplateSignature;
  dependencies: TemplateDependency[];
  capabilities: CapabilityRequirement[];
  permissions: TemplatePermissions;
  icon: string;
  color?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}
