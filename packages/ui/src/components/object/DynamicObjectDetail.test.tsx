import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import type { ObjectDefinition, SchemaDefinition } from '@lumora/shared';
import { FieldType } from '@lumora/shared';
import { DynamicObjectDetail } from './DynamicObjectDetail';
import type { UniversalObjectData } from '../detail/BlockRegistry.types';

describe('DynamicObjectDetail Universal Object Contract', () => {
  const dummyTaskDefinition: ObjectDefinition = {
    typeKey: 'task',
    name: 'Task',
    pluralName: 'Tasks',
    description: 'A manageable task item',
    icon: 'task',
    allowedCapabilities: ['reminder', 'timeline'],
    traits: ['assignable'],
    schemaVersion: 1,
  };

  const dummyTaskSchema: SchemaDefinition = {
    typeKey: 'task',
    schemaVersion: 1,
    fields: [
      { key: 'title', label: 'Title', type: FieldType.STRING },
      { key: 'priority', label: 'Priority', type: FieldType.NUMBER },
      { key: 'isCompleted', label: 'Completed', type: FieldType.BOOLEAN },
    ],
  };

  const dummyTaskObject: UniversalObjectData = {
    id: 'obj-task-123456',
    typeKey: 'task',
    status: 'ACTIVE',
    attributes: {
      title: 'Complete Lumora Batch 5 Verification',
      priority: 0, // Must preserve 0!
      isCompleted: false, // Must preserve false!
    },
  };

  it('renders Universal Object title, status, and properties from schema metadata', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            object={dummyTaskObject}
            definition={dummyTaskDefinition}
            schema={dummyTaskSchema}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Complete Lumora Batch 5 Verification')).toBeTruthy();
    expect(getByText('Task')).toBeTruthy();
    expect(getByText('ACTIVE')).toBeTruthy();
    expect(getByText('Priority')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('False')).toBeTruthy();
  });

  it('renders any custom object (e.g. Camera Equipment) without domain coupling', () => {
    const cameraDef: ObjectDefinition = {
      typeKey: 'camera',
      name: 'Camera Equipment',
      pluralName: 'Cameras',
      icon: 'camera',
      allowedCapabilities: [],
      traits: [],
      schemaVersion: 1,
    };

    const cameraSchema: SchemaDefinition = {
      typeKey: 'camera',
      schemaVersion: 1,
      fields: [
        { key: 'brand', label: 'Brand', type: FieldType.STRING },
        { key: 'lens', label: 'Lens Spec', type: FieldType.STRING },
      ],
    };

    const cameraObj: UniversalObjectData = {
      id: 'cam-999',
      typeKey: 'camera',
      attributes: {
        title: 'Sony Alpha A7IV',
        brand: 'Sony',
        lens: '24-70mm f/2.8 GM II',
      },
    };

    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            object={cameraObj}
            definition={cameraDef}
            schema={cameraSchema}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Sony Alpha A7IV')).toBeTruthy();
    expect(getByText('Camera Equipment')).toBeTruthy();
    expect(getByText('Sony')).toBeTruthy();
    expect(getByText('24-70mm f/2.8 GM II')).toBeTruthy();
  });

  it('renders unresolved block fallback for deferred capability blocks without crashing', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            object={dummyTaskObject}
            definition={dummyTaskDefinition}
            schema={dummyTaskSchema}
            blocks={['header', 'properties', 'timeline_preview']}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Complete Lumora Batch 5 Verification')).toBeTruthy();
    expect(getByText('Capability Block [timeline_preview] is deferred in Batch 5.')).toBeTruthy();
  });

  it('renders loading, error, and empty states safely', () => {
    const { getByText, rerender } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            isLoading={true}
            definition={dummyTaskDefinition}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Loading object details...')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            isError={true}
            errorMessage="Custom network error"
            definition={dummyTaskDefinition}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Unable to Display Object')).toBeTruthy();
    expect(getByText('Custom network error')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            object={undefined}
            definition={dummyTaskDefinition}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Object Not Found')).toBeTruthy();
  });

  it('triggers onEdit callback when Edit action button is pressed', () => {
    const handleEdit = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            object={dummyTaskObject}
            definition={dummyTaskDefinition}
            schema={dummyTaskSchema}
            onEdit={handleEdit}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const editBtn = getByText('Edit');
    fireEvent.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(dummyTaskObject);
  });

  it('requires confirmation before executing Delete action', () => {
    const handleDelete = vi.fn();
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicObjectDetail
            object={dummyTaskObject}
            definition={dummyTaskDefinition}
            schema={dummyTaskSchema}
            onDelete={handleDelete}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    // 1. Click Delete action button
    const deleteBtn = getByText('Delete');
    fireEvent.click(deleteBtn);

    // 2. Confirmation Dialog appears
    expect(getByText('Delete Task?')).toBeTruthy();
    expect(handleDelete).not.toHaveBeenCalled();

    // 3. Click Cancel inside Dialog
    const cancelBtn = getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(queryByText('Delete Task?')).toBeNull();
    expect(handleDelete).not.toHaveBeenCalled();

    // 4. Click Delete action button again and confirm
    fireEvent.click(deleteBtn);
    const confirmBtn = getByText('Delete');
    fireEvent.click(confirmBtn);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(dummyTaskObject);
  });
});
