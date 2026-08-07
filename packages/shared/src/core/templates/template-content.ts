import type { ObjectDefinition } from '../catalog/object-definition.js';
import type { SchemaDefinition } from '../catalog/schema-definition.js';
import type { TemplateManifest } from './template-manifest.js';

export enum SeedObjectType {
  SYSTEM = 'SYSTEM',
  WORKSPACE = 'WORKSPACE',
  SAMPLE = 'SAMPLE',
}

export interface CategorizedSeedObject {
  type: SeedObjectType;
  objectTypeKey: string;
  title: string;
  description?: string;
  attributes: Record<string, unknown>;
}

export interface FormLayoutSection {
  id: string;
  title: string;
  fieldKeys: string[];
}

export interface FormLayoutBlueprint {
  objectTypeKey: string;
  sections: FormLayoutSection[];
}

export interface DetailLayoutBlock {
  id: string;
  blockType: string;
  title?: string;
  config?: Record<string, unknown>;
}

export interface DetailLayoutBlueprint {
  objectTypeKey: string;
  blocks: DetailLayoutBlock[];
}

export interface TemplateContent {
  objectDefinitions: ObjectDefinition[];
  schemaDefinitions: SchemaDefinition[];
  formLayouts?: Record<string, FormLayoutBlueprint>;
  detailLayouts?: Record<string, DetailLayoutBlueprint>;
  seedObjects?: CategorizedSeedObject[];
}

export interface TemplatePackage {
  manifest: TemplateManifest;
  content: TemplateContent;
}
