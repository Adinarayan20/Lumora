import { useState, useCallback } from 'react';
import type { DynamicObjectDetailProps, ObjectActionConfig } from './DynamicObjectDetail.types';
import type { UniversalObjectData } from '../detail/BlockRegistry.types';

export interface UseObjectDetailResult {
  readonly isEditing: boolean;
  readonly setIsEditing: (editing: boolean) => void;
  readonly pendingAction: ObjectActionConfig | null;
  readonly isConfirmationOpen: boolean;
  readonly requestActionConfirmation: (action: ObjectActionConfig) => void;
  readonly handleConfirmPendingAction: () => void;
  readonly handleCancelPendingAction: () => void;
  readonly resolvedActions: readonly ObjectActionConfig[];
}

export function useObjectDetail(props: DynamicObjectDetailProps): UseObjectDetailResult {
  const { object, schema, actions, onEdit, onDelete, onArchive } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [pendingAction, setPendingAction] = useState<ObjectActionConfig | null>(null);

  const requestActionConfirmation = useCallback((action: ObjectActionConfig) => {
    setPendingAction(action);
  }, []);

  const handleCancelPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const handleConfirmPendingAction = useCallback(() => {
    const actionToExecute = pendingAction;
    setPendingAction(null);

    if (!object || !actionToExecute) return;

    if (actionToExecute.key === 'delete' && onDelete) {
      onDelete(object);
    }

    if (actionToExecute.onPress) {
      actionToExecute.onPress(object);
    }
  }, [object, pendingAction, onDelete]);

  const defaultActions: ObjectActionConfig[] = [];

  if (onEdit) {
    const isEditDisabled = Boolean(schema && (!schema.fields || schema.fields.length === 0));
    defaultActions.push({
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'secondary',
      disabled: isEditDisabled,
      onPress: (obj: UniversalObjectData) => {
        setIsEditing(true);
        onEdit(obj);
      },
    });
  }

  if (onArchive) {
    defaultActions.push({
      key: 'archive',
      label: 'Archive',
      icon: 'archive',
      variant: 'secondary',
      onPress: (obj: UniversalObjectData) => {
        onArchive(obj);
      },
    });
  }

  if (onDelete) {
    defaultActions.push({
      key: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      requiresConfirmation: true,
    });
  }

  const resolvedActions = actions ?? defaultActions;

  return {
    isEditing,
    setIsEditing,
    pendingAction,
    isConfirmationOpen: pendingAction !== null,
    requestActionConfirmation,
    handleConfirmPendingAction,
    handleCancelPendingAction,
    resolvedActions,
  };
}
