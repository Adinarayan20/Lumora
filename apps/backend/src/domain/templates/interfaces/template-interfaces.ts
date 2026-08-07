import type {
  Result,
  TemplatePackage,
  TemplateManifest,
  UniqueEntityId,
} from '@lumora/shared';

export interface PolicyEvaluationResult {
  allowed: boolean;
  violations: string[];
  warnings: string[];
}

export interface ITemplatePolicyEngine {
  evaluate(
    manifest: TemplateManifest,
    workspaceId: UniqueEntityId,
  ): Promise<PolicyEvaluationResult>;
}

export interface ITemplateSignatureVerifier {
  verifySignature(manifest: TemplateManifest): Promise<boolean>;
}

export interface TemplatePlan {
  templateKey: string;
  targetWorkspaceId: string;
  installOrder: string[];
  newObjectDefinitions: unknown[];
  schemaMigrations: unknown[];
  capabilitiesToAttach: unknown[];
  seedObjectsToCreate: unknown[];
  warnings: string[];
  isDryRun: boolean;
}

export interface ITemplatePlanner {
  planInstallation(
    pkg: TemplatePackage,
    workspaceId: UniqueEntityId,
    options?: { dryRun?: boolean },
  ): Promise<Result<TemplatePlan>>;
}

export interface ITemplateInstaller {
  install(
    plan: TemplatePlan,
    contextUserId: UniqueEntityId,
  ): Promise<Result<void>>;
}

export interface ITemplateMigrationStrategy {
  migrate(
    workspaceId: UniqueEntityId,
    templateKey: string,
    fromVersion: string,
    toVersion: string,
  ): Promise<Result<void>>;
}

export interface ITemplateImportPipeline {
  importPackage(
    rawJsonPayload: string,
    workspaceId: UniqueEntityId,
  ): Promise<Result<TemplatePlan>>;
}
