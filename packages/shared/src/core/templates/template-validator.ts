import { DomainValidationException } from '../errors/domain-exceptions.js';
import { Result } from '../primitives/result.js';
import type { TemplatePackage } from './template-content.js';
import type { TemplateManifest } from './template-manifest.js';

export class TemplateValidator {
  public static validate(pkg: TemplatePackage): Result<void> {
    const manifestResult = this.validateManifest(pkg.manifest);
    if (manifestResult.isFailure) {
      return manifestResult;
    }

    const contentResult = this.validateContent(pkg);
    if (contentResult.isFailure) {
      return contentResult;
    }

    return Result.ok<void>(undefined);
  }

  public static validateManifest(manifest: TemplateManifest): Result<void> {
    if (!manifest.id || manifest.id.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify an id.'));
    }
    if (!manifest.key || manifest.key.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify a key.'));
    }
    if (!manifest.name || manifest.name.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify a name.'));
    }
    if (!manifest.version || manifest.version.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify a version.'));
    }
    if (!manifest.packageUuid || manifest.packageUuid.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify a packageUuid.'));
    }
    if (!manifest.publisherUuid || manifest.publisherUuid.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify a publisherUuid.'));
    }
    if (!manifest.packageHash || manifest.packageHash.trim().length === 0) {
      return Result.fail(new DomainValidationException('Template Manifest must specify a packageHash.'));
    }

    return Result.ok<void>(undefined);
  }

  public static validateContent(pkg: TemplatePackage): Result<void> {
    const { content } = pkg;
    if (!content.objectDefinitions || content.objectDefinitions.length === 0) {
      return Result.fail(
        new DomainValidationException(
          `Template '${pkg.manifest.key}' must define at least one ObjectDefinition.`,
        ),
      );
    }
    if (!content.schemaDefinitions || content.schemaDefinitions.length === 0) {
      return Result.fail(
        new DomainValidationException(
          `Template '${pkg.manifest.key}' must define at least one SchemaDefinition.`,
        ),
      );
    }

    // Check that every ObjectDefinition has a matching SchemaDefinition
    for (const objDef of content.objectDefinitions) {
      const schema = content.schemaDefinitions.find((s) => s.typeKey === objDef.typeKey);
      if (!schema) {
        return Result.fail(
          new DomainValidationException(
            `ObjectDefinition '${objDef.typeKey}' missing corresponding SchemaDefinition in template '${pkg.manifest.key}'.`,
          ),
        );
      }
    }

    return Result.ok<void>(undefined);
  }
}

