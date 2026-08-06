/**
 * Abstract base class for immutable Domain Value Objects.
 * Value Objects are identified solely by their structural attributes rather than an identity key.
 */
export abstract class ValueObject<T extends Record<string, unknown>> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  /**
   * Evaluates structural equality against another ValueObject.
   * Enforces that both value objects are instances of the exact same concrete class.
   */
  public equals(vo?: ValueObject<T> | undefined): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (this === vo) {
      return true;
    }

    if (this.constructor !== vo.constructor) {
      return false;
    }

    return this.shallowEqual(this.props, vo.props);
  }

  private shallowEqual(objA: Record<string, unknown>, objB: Record<string, unknown>): boolean {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(objB, key) || objA[key] !== objB[key]) {
        return false;
      }
    }

    return true;
  }
}
