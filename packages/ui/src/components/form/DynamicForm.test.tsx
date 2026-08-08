import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { FieldType, type FieldSchema } from '@lumora/shared';
import { DynamicForm } from './DynamicForm';

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

  it('renders schema-driven form fields in correct order with default values', () => {
    const handleSubmit = vi.fn();
    const { getByLabelText, getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicForm fields={sampleSchema} onSubmit={handleSubmit} />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByLabelText('Task Title')).toBeTruthy();
    expect(getByDisplayValue('Default Task')).toBeTruthy();
    expect(getByDisplayValue('1')).toBeTruthy();
    expect(getByLabelText('Category')).toBeTruthy();
    expect(getByLabelText('Archived')).toBeTruthy();
  });

  it('blocks submission and displays error when validation fails', () => {
    const handleSubmit = vi.fn();
    const { getByText, getByDisplayValue } = render(
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

  it('submits normalized values when validation succeeds', () => {
    const handleSubmit = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <DynamicForm
            fields={sampleSchema}
            initialValues={{
              title: 'Buy Groceries',
              priority: 2,
              category: 'Personal',
              isArchived: false,
            }}
            onSubmit={handleSubmit}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const submitBtn = getByText('Submit');
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      title: 'Buy Groceries',
      priority: 2,
      category: 'Personal',
      isArchived: false,
    });
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
