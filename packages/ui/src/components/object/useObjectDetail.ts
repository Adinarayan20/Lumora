import { useState, useCallback } from 'react';
import type { DynamicObjectDetailProps, ObjectActionConfig } from './DynamicObjectDetail.types';
import type { UniversalObjectData } from '../detail/BlockRegistry.types';

export interface UseObjectDetailResult {
  readonly isEditing: boolean;
  readonly setIsEditing: (editing: boolean) => void;
  readonly isDeleteDialogOpen: boolean;
  readonly openDeleteDialog: () => void;
  readonly closeDeleteDialog: () => void;
  readonly handleConfirmDelete: () => void;
  readonly resolvedActions: readonly ObjectActionConfig[];
}

export function useObjectDetail(props: DynamicObjectDetailProps): UseObjectDetailResult {
  const { object, actions, onEdit, onDelete, onArchive } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    if (object && onDelete) {
      onDelete(object);
    }
  }, [object, onDelete]);

  const defaultActions: ObjectActionConfig[] = [];

  if (onEdit) {
    defaultActions.push({
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      variant: 'secondary',
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
      onPress: () => {
        openDeleteDialog();
      },
    });
  }

  const resolvedActions = actions ?? defaultActions;

  return {
    isEditing,
    setIsEditing,
    isDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    handleConfirmDelete,
    resolvedActions,
  };
}
