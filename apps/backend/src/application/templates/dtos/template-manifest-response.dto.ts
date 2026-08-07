import type { TemplateManifest } from '@lumora/shared';

export interface TemplateManifestResponseDto {
  id: string;
  packageUuid: string;
  publisherUuid: string;
  packageHash: string;
  key: string;
  name: string;
  description: string;
  category: string;
  version: string;
  minPlatformVersion: string;
  authorName: string;
  publisherTrustLevel: string;
  icon: string;
  color?: string;
  tags: string[];
}

export function mapManifestToResponseDto(manifest: TemplateManifest): TemplateManifestResponseDto {
  return {
    id: manifest.id,
    packageUuid: manifest.packageUuid,
    publisherUuid: manifest.publisherUuid,
    packageHash: manifest.packageHash,
    key: manifest.key,
    name: manifest.name,
    description: manifest.description,
    category: manifest.category,
    version: manifest.version,
    minPlatformVersion: manifest.minPlatformVersion,
    authorName: manifest.author.name,
    publisherTrustLevel: manifest.author.trustLevel,
    icon: manifest.icon,
    color: manifest.color,
    tags: manifest.tags,
  };
}
