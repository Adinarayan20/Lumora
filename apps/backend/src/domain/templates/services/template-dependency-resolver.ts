import { DomainValidationException } from '@lumora/shared';
import type { TemplatePackage } from '@lumora/shared';

export class TemplateDependencyResolver {
  public static resolveInstallationOrder(
    targetPackage: TemplatePackage,
    availablePackages: TemplatePackage[] = [],
  ): string[] {
    const packageMap = new Map<string, TemplatePackage>();
    packageMap.set(targetPackage.manifest.key, targetPackage);
    for (const pkg of availablePackages) {
      packageMap.set(pkg.manifest.key, pkg);
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (key: string) => {
      if (visiting.has(key)) {
        throw new DomainValidationException(
          `Circular dependency detected in template dependency graph involving key '${key}'.`,
        );
      }

      if (!visited.has(key)) {
        visiting.add(key);
        const pkg = packageMap.get(key);
        if (pkg && pkg.manifest.dependencies) {
          for (const dep of pkg.manifest.dependencies) {
            if (!packageMap.has(dep.templateKey)) {
              throw new DomainValidationException(
                `Missing required template dependency '${dep.templateKey}' for template '${key}'.`,
              );
            }
            visit(dep.templateKey);
          }
        }
        visiting.delete(key);
        visited.add(key);
        order.push(key);
      }
    };

    visit(targetPackage.manifest.key);
    return order;
  }
}
