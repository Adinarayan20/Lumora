export interface CapabilityCompatibilityRule {
  capabilityKey: string;
  targetCapabilityKey: string;
  minVersion: string;
  maxVersion?: string;
  compatible: boolean;
  reason?: string;
}

export class CapabilityCompatibilityMatrix {
  private static readonly rules: CapabilityCompatibilityRule[] = [
    {
      capabilityKey: 'timeline',
      targetCapabilityKey: 'search',
      minVersion: '1.0.0',
      compatible: true,
    },
    {
      capabilityKey: 'reminders',
      targetCapabilityKey: 'timeline',
      minVersion: '1.0.0',
      compatible: true,
    },
    {
      capabilityKey: 'relationships',
      targetCapabilityKey: 'timeline',
      minVersion: '1.0.0',
      compatible: true,
    },
  ];

  public static isCompatible(
    sourceKey: string,
    sourceVersion: string,
    targetKey: string,
    targetVersion: string,
  ): boolean {
    const sKey = sourceKey.toLowerCase();
    const tKey = targetKey.toLowerCase();

    const rule = this.rules.find(
      (r) =>
        r.capabilityKey.toLowerCase() === sKey &&
        r.targetCapabilityKey.toLowerCase() === tKey,
    );

    if (!rule) {
      return true; // Default compatible if no explicit rule prohibits it
    }

    return rule.compatible;
  }
}
