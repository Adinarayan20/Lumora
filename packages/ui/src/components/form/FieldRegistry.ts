import { FieldType } from '@lumora/shared';
import type { FieldControlComponent, IFieldRegistry } from './DynamicForm.types';
import { StringFieldAdapter } from './adapters/StringFieldAdapter';
import { NumberFieldAdapter } from './adapters/NumberFieldAdapter';
import { BooleanFieldAdapter } from './adapters/BooleanFieldAdapter';
import { EnumFieldAdapter } from './adapters/EnumFieldAdapter';
import { UnresolvedFieldAdapter } from './adapters/UnresolvedFieldAdapter';

export class FieldRegistry implements IFieldRegistry {
  private readonly controls = new Map<FieldType, FieldControlComponent>();
  private readonly parent?: IFieldRegistry;

  constructor(parent?: IFieldRegistry) {
    this.parent = parent;
  }

  public register(fieldType: FieldType, component: FieldControlComponent): void {
    this.controls.set(fieldType, component);
  }

  public has(fieldType: FieldType): boolean {
    if (this.controls.has(fieldType)) {
      return true;
    }
    return this.parent ? this.parent.has(fieldType) : false;
  }

  public get(fieldType: FieldType): FieldControlComponent {
    const local = this.controls.get(fieldType);
    if (local) {
      return local;
    }

    if (this.parent) {
      const parentControl = this.parent.get(fieldType);
      if (parentControl) {
        return parentControl;
      }
    }

    // Default fallback adapter for deferred or unresolved field types
    return UnresolvedFieldAdapter;
  }

  public createChild(): IFieldRegistry {
    return new FieldRegistry(this);
  }
}

/**
 * Default global field registry initialized with standard Lumora primitive adapters.
 */
export const defaultFieldRegistry = new FieldRegistry();
defaultFieldRegistry.register(FieldType.STRING, StringFieldAdapter);
defaultFieldRegistry.register(FieldType.NUMBER, NumberFieldAdapter);
defaultFieldRegistry.register(FieldType.BOOLEAN, BooleanFieldAdapter);
defaultFieldRegistry.register(FieldType.ENUM, EnumFieldAdapter);
