import type { SystemTrait } from "./system-trait.js";

/**
 * Universal object definition contract for dynamic object type declaration.
 */
export interface ObjectDefinition {
  readonly typeKey: string;
  readonly name: string;
  readonly pluralName: string;
  readonly description?: string;
  readonly icon: string;
  readonly color?: string;
  readonly allowedCapabilities: readonly string[];
  readonly traits: readonly SystemTrait[];
  readonly schemaVersion: number;
}
