import type { ObjectDefinition, SchemaDefinition } from '@lumora/shared';
import type {
  UniversalObjectData,
  BlockTypeKey,
  IBlockRegistry,
} from '../detail/BlockRegistry.types';

export type ObjectActionKey = 'edit' | 'delete' | 'archive' | 'complete' | string;

export interface ObjectActionConfig {
  readonly key: ObjectActionKey;
  readonly label: string;
  readonly icon?: string;
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  readonly requiresConfirmation?: boolean;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onPress?: (object: UniversalObjectData) => void;
}

export interface DynamicObjectDetailProps {
  readonly object?: UniversalObjectData;
  readonly definition: ObjectDefinition;
  readonly schema?: SchemaDefinition;
  readonly blockRegistry?: IBlockRegistry;
  readonly blocks?: readonly BlockTypeKey[];
  readonly actions?: readonly ObjectActionConfig[];
  readonly onEdit?: (object: UniversalObjectData) => void;
  readonly onDelete?: (object: UniversalObjectData) => void;
  readonly onArchive?: (object: UniversalObjectData) => void;
  readonly onStatusChange?: (object: UniversalObjectData, newStatus: string) => void;
  readonly isLoading?: boolean;
  readonly isError?: boolean;
  readonly errorMessage?: string;
  readonly testID?: string;
}
