export interface CapabilityCompatibilityDefinition {
  readonly id: string;
  readonly capabilityKey: string;
  readonly targetCapabilityKey: string;
  readonly minVersion?: string;
  readonly maxVersion?: string;
  readonly minPlatformVersion?: string;
  readonly requiredFeatureFlag?: string;
  readonly directional?: boolean; // If false/undefined, applies symmetrically
  readonly compatible: boolean;
  readonly reason?: string;
}

export interface CompatibilityConflict {
  readonly capabilityKey: string;
  readonly targetCapabilityKey: string;
  readonly reason: string;
}

export interface CompatibilityWarning {
  readonly capabilityKey: string;
  readonly message: string;
}

export interface WorkspacePolicy {
  readonly workspaceId: string;
  readonly plan: string;
  readonly allowExperimentalFeatures: boolean;
  readonly limits: Readonly<Record<string, number>>;
  readonly enterpriseRestrictions?: readonly string[];
}

export interface CompatibilityContext {
  readonly platformVersion: string;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly permissions?: readonly string[];
  readonly workspacePolicy?: WorkspacePolicy;
}

export interface CompatibilityEvaluationResult {
  readonly compatible: boolean;
  readonly conflicts: readonly CompatibilityConflict[];
  readonly warnings: readonly CompatibilityWarning[];
  readonly evaluatedRulesCount: number;
  readonly skippedRulesCount: number;
  readonly incompatibleCapabilities: readonly string[];
  readonly metadataVersion: number;
}

export interface ICapabilityCompatibilityRegistry {
  registerDefinition(definition: CapabilityCompatibilityDefinition): void;
  unregisterDefinition(definitionId: string): void;
  getDefinitions(
    capabilityKey: string,
    targetCapabilityKey: string,
  ): readonly CapabilityCompatibilityDefinition[];
  getAllDefinitions(): readonly CapabilityCompatibilityDefinition[];
  clear(): void;
  setMetadataVersion(version: number): void;
  getMetadataVersion(): number;
}

export class CapabilityCompatibilityRegistry implements ICapabilityCompatibilityRegistry {
  // O(1) indexed storage: Map<sourceKey, Map<targetKey, CapabilityCompatibilityDefinition[]>>
  private readonly definitionsMap = new Map<
    string,
    Map<string, CapabilityCompatibilityDefinition[]>
  >();
  private readonly allDefinitions = new Map<
    string,
    CapabilityCompatibilityDefinition
  >();
  private _metadataVersion = 1;

  public registerDefinition(
    definition: CapabilityCompatibilityDefinition,
  ): void {
    const srcKey = definition.capabilityKey.toLowerCase();
    const targetKey = definition.targetCapabilityKey.toLowerCase();

    this.addDefinitionToMap(srcKey, targetKey, definition);

    // If symmetric, index reverse lookup
    if (definition.directional === false) {
      this.addDefinitionToMap(targetKey, srcKey, definition);
    }

    this.allDefinitions.set(definition.id, definition);
  }

  private addDefinitionToMap(
    srcKey: string,
    targetKey: string,
    definition: CapabilityCompatibilityDefinition,
  ): void {
    if (!this.definitionsMap.has(srcKey)) {
      this.definitionsMap.set(srcKey, new Map());
    }
    const targetMap = this.definitionsMap.get(srcKey)!;
    if (!targetMap.has(targetKey)) {
      targetMap.set(targetKey, []);
    }
    targetMap.get(targetKey)!.push(definition);
  }

  public unregisterDefinition(definitionId: string): void {
    const definition = this.allDefinitions.get(definitionId);
    if (definition) {
      const srcKey = definition.capabilityKey.toLowerCase();
      const targetKey = definition.targetCapabilityKey.toLowerCase();

      this.removeDefinitionFromMap(srcKey, targetKey, definitionId);
      if (definition.directional === false) {
        this.removeDefinitionFromMap(targetKey, srcKey, definitionId);
      }
      this.allDefinitions.delete(definitionId);
    }
  }

  private removeDefinitionFromMap(
    srcKey: string,
    targetKey: string,
    definitionId: string,
  ): void {
    const targetMap = this.definitionsMap.get(srcKey);
    if (targetMap && targetMap.has(targetKey)) {
      const list = targetMap.get(targetKey)!;
      const index = list.findIndex((d) => d.id === definitionId);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
  }

  public getDefinitions(
    capabilityKey: string,
    targetCapabilityKey: string,
  ): readonly CapabilityCompatibilityDefinition[] {
    const srcKey = capabilityKey.toLowerCase();
    const targetKey = targetCapabilityKey.toLowerCase();
    const list = this.definitionsMap.get(srcKey)?.get(targetKey);
    return Object.freeze([...(list ?? [])]);
  }

  public getAllDefinitions(): readonly CapabilityCompatibilityDefinition[] {
    return Object.freeze(Array.from(this.allDefinitions.values()));
  }

  public clear(): void {
    this.definitionsMap.clear();
    this.allDefinitions.clear();
  }

  public setMetadataVersion(version: number): void {
    this._metadataVersion = version;
  }

  public getMetadataVersion(): number {
    return this._metadataVersion;
  }
}

export interface ICompatibilityResolver {
  evaluate(
    capabilities: readonly { key: string; versionConstraint: string }[],
    context: CompatibilityContext,
  ): CompatibilityEvaluationResult;
}

export class CompatibilityResolver implements ICompatibilityResolver {
  constructor(private readonly registry: ICapabilityCompatibilityRegistry) {}

  public evaluate(
    capabilities: readonly { key: string; versionConstraint: string }[],
    context: CompatibilityContext,
  ): CompatibilityEvaluationResult {
    const conflicts: CompatibilityConflict[] = [];
    const warnings: CompatibilityWarning[] = [];
    const incompatibleSet = new Set<string>();

    let evaluatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < capabilities.length; i++) {
      for (let j = i + 1; j < capabilities.length; j++) {
        const reqA = capabilities[i];
        const reqB = capabilities[j];
        if (!reqA || !reqB) continue;

        const definitions = this.registry.getDefinitions(reqA.key, reqB.key);
        if (definitions.length === 0) {
          skippedCount += 1;
          continue;
        }

        for (const def of definitions) {
          evaluatedCount += 1;

          // 1. Evaluate required feature flag
          if (
            def.requiredFeatureFlag &&
            !context.featureFlags[def.requiredFeatureFlag]
          ) {
            skippedCount += 1;
            warnings.push({
              capabilityKey: reqA.key,
              message: `Feature flag '${def.requiredFeatureFlag}' is disabled. Definition '${def.id}' skipped.`,
            });
            continue;
          }

          // 2. Evaluate explicit incompatibility
          if (!def.compatible) {
            conflicts.push({
              capabilityKey: reqA.key,
              targetCapabilityKey: reqB.key,
              reason:
                def.reason ??
                `Capability '${reqA.key}' is explicitly incompatible with '${reqB.key}'.`,
            });
            incompatibleSet.add(reqA.key);
            incompatibleSet.add(reqB.key);
          }
        }
      }
    }

    return {
      compatible: conflicts.length === 0,
      conflicts: Object.freeze(conflicts),
      warnings: Object.freeze(warnings),
      evaluatedRulesCount: evaluatedCount,
      skippedRulesCount: skippedCount,
      incompatibleCapabilities: Object.freeze(Array.from(incompatibleSet)),
      metadataVersion: this.registry.getMetadataVersion(),
    };
  }
}
