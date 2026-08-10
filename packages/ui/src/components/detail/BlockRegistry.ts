import type {
  BlockTypeKey,
  DetailBlockComponent,
  IBlockRegistry,
} from "./BlockRegistry.types";
import { HeaderBlockAdapter } from "./adapters/HeaderBlockAdapter";
import { PropertiesBlockAdapter } from "./adapters/PropertiesBlockAdapter";
import { UnresolvedBlockAdapter } from "./adapters/UnresolvedBlockAdapter";

export class BlockRegistry implements IBlockRegistry {
  private readonly map: Map<BlockTypeKey, DetailBlockComponent>;
  private readonly parent?: BlockRegistry;

  constructor(parent?: BlockRegistry) {
    this.map = new Map();
    this.parent = parent;
  }

  /**
   * Retrieves registered block adapter component for a given blockKey.
   * Returns UnresolvedBlockAdapter as safe non-crashing fallback if key is unknown.
   */
  public get(blockKey: BlockTypeKey): DetailBlockComponent {
    const local = this.map.get(blockKey);
    if (local) {
      return local;
    }
    if (this.parent) {
      return this.parent.get(blockKey);
    }
    return UnresolvedBlockAdapter;
  }

  /**
   * Evaluates whether a given blockKey is registered locally or in parent hierarchy.
   */
  public has(blockKey: BlockTypeKey): boolean {
    if (this.map.has(blockKey)) {
      return true;
    }
    return this.parent ? this.parent.has(blockKey) : false;
  }

  /**
   * Registers a block adapter component for a specific blockKey.
   */
  public register(
    blockKey: BlockTypeKey,
    component: DetailBlockComponent,
  ): void {
    this.map.set(blockKey, component);
  }

  /**
   * Creates an isolated child registry inheriting parent registrations without mutating parent.
   */
  public createChild(): BlockRegistry {
    return new BlockRegistry(this);
  }
}

/**
 * Factory function creating a fresh isolated BlockRegistry pre-populated with core built-in detail block adapters.
 */
export function createCoreBlockRegistry(): BlockRegistry {
  const registry = new BlockRegistry();
  registry.register("header", HeaderBlockAdapter);
  registry.register("properties", PropertiesBlockAdapter);
  return registry;
}

/**
 * Shared default instance pre-populated with core built-in detail block adapters.
 */
export const defaultBlockRegistry = createCoreBlockRegistry();
