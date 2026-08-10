import React from "react";
import type {
  ObjectDefinition,
  SchemaDefinition,
  FieldSchema,
} from "@lumora/shared";

export type BlockTypeKey =
  | "header"
  | "properties"
  | "timeline_preview"
  | "reminder_summary"
  | "attachments_preview"
  | "relationship_graph"
  | string;

export interface UniversalObjectData {
  readonly id: string;
  readonly typeKey: string;
  readonly attributes: Record<string, unknown>;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly status?: string;
}

export interface BlockAdapterProps {
  readonly object: UniversalObjectData;
  readonly definition: ObjectDefinition;
  readonly schema?: SchemaDefinition;
  readonly fields?: readonly FieldSchema[];
  readonly blockKey: BlockTypeKey;
  readonly config?: Record<string, unknown>;
  readonly testID?: string;
}

export type DetailBlockComponent = React.ComponentType<BlockAdapterProps>;

export interface IBlockRegistry {
  get(blockKey: BlockTypeKey): DetailBlockComponent;
  has(blockKey: BlockTypeKey): boolean;
  register(blockKey: BlockTypeKey, component: DetailBlockComponent): void;
  createChild(): IBlockRegistry;
}
