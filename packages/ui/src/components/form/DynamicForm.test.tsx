import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { FieldType, type FieldSchema } from '@lumora/shared';
import { DynamicForm } from './DynamicForm';

const DynamicFormSyncTest = ({ initialTitle }: { initialTitle: string }) => {
  const schema: FieldSchema[] = [
    {
      key: 'title',
      label: 'Task Title',
      type: FieldType.STRING,
    },
  ];

  return (
    <DynamicForm
      fields={schema}
      initialValues={{ title: initialTitle }}
      onSubmit={vi.fn()}
    />
  );
};

describe('DynamicForm Integration Contract', () => {
  const sampleSchema: FieldSchema[] = [
    {
      key: 'title',
      label: 'Task Title',
      type: FieldType.STRING,
      defaultValue: 'Default Task',
      validation: { required: true },
    },
    {
      key: 'priority',
      label: 'Priority',
      type: FieldType.NUMBER,
      defaultValue: 1,
    },
    {
      key: 'category',
      label: 'Category',
      type: FieldType.ENUM,
      defaultValue: 'Work',
      validation: { options: ['Work', 'Personal', 'Health'] },
    },
    {
      key: 'isArchived',
      label: 'Archived',
      type: FieldType.BOOLEAN,
      defaultValue: false,
    },
  ];

  it('renders schema-driven form fields with form accessibility role', () => {
    const handleSubmit = vi.fn();
    const { getByRole, getByLabelText, getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicForm fields={sampleSchema} onSubmit={handleSubmit} />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByRole('form')).toBeTruthy();
    expect(getByLabelText('Task Title')).toBeTruthy();
    expect(getByDisplayValue('Default Task')).toBeTruthy();
  });

  it('synchronizes internal form state when initialValues prop changes dynamically', () => {
    const { getByDisplayValue, rerender } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicFormSyncTest initialTitle="Task A" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('Task A')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicFormSyncTest initialTitle="Task B" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('Task B')).toBeTruthy();
  });

  it('proves state transition during form reset (Initial -> Edited -> Reset -> Initial)', () => {
    const handleSubmit = vi.fn();
    const handleReset = vi.fn();

    const { getByText, getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicForm
            fields={sampleSchema}
            initialValues={{ title: 'Initial Value' }}
            showResetButton={true}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    // 1. Initial State Assert
    const input = getByDisplayValue('Initial Value');
    expect(input).toBeTruthy();

    // 2. Edit Action & Assert
    fireEvent.change(input, { target: { value: 'Edited Value' } });
    expect(getByDisplayValue('Edited Value')).toBeTruthy();

    // 3. Reset Action
    const resetBtn = getByText('Reset');
    fireEvent.click(resetBtn);

    // 4. Assert Reset State Restored & Callback Invoked Exactly Once
    expect(getByDisplayValue('Initial Value')).toBeTruthy();
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('blocks submission and displays error when validation fails', () => {
    const handleSubmit = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicForm
            fields={sampleSchema}
            initialValues={{ title: '' }}
            onSubmit={handleSubmit}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const submitBtn = getByText('Submit');
    fireEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(getByText('Task Title is required.')).toBeTruthy();
  });

  it('triggers onCancel callback when Cancel button is clicked', () => {
    const handleSubmit = vi.fn();
    const handleCancel = vi.fn();

    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicForm
            fields={sampleSchema}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const cancelBtn = getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
