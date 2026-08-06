import { ValueObject, Guard, DomainValidationException } from '@lumora/shared';

interface HouseholdNameProps extends Record<string, unknown> {
  value: string;
}

export class HouseholdName extends ValueObject<HouseholdNameProps> {
  private constructor(props: HouseholdNameProps) {
    super(props);
  }

  public static create(name: string): HouseholdName {
    const nullGuard = Guard.againstNullOrUndefined(name, 'name');
    if (nullGuard.isFailure) throw nullGuard.getError();

    const trimmed = name.trim();
    const emptyGuard = Guard.againstEmptyString(trimmed, 'name');
    if (emptyGuard.isFailure) throw emptyGuard.getError();

    if (trimmed.length > 100) {
      throw new DomainValidationException(
        'Household name cannot exceed 100 characters.',
        { name: ['Household name length exceeds 100 characters limit.'] },
      );
    }

    return new HouseholdName({ value: trimmed });
  }

  public getValue(): string {
    return this.props.value;
  }
}
