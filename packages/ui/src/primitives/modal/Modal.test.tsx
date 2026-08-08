import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Modal } from './Modal';
import { Dialog } from './Dialog';

describe('Modal & Dialog Primitive Contract', () => {
  it('renders modal title and body content when visible is true', () => {
    const handleClose = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Modal visible={true} onRequestClose={handleClose} title="Delete Object Confirmation">
            <Text>Are you sure you want to proceed?</Text>
          </Modal>
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Delete Object Confirmation')).toBeTruthy();
    expect(getByText('Are you sure you want to proceed?')).toBeTruthy();
  });

  it('triggers primaryAction onPress in Dialog component', () => {
    const handleClose = vi.fn();
    const handlePrimary = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Dialog
            visible={true}
            onRequestClose={handleClose}
            title="Confirm Action"
            description="This action cannot be undone."
            primaryAction={{ label: 'Delete', onPress: handlePrimary, variant: 'danger' }}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Confirm Action')).toBeTruthy();
    expect(getByText('This action cannot be undone.')).toBeTruthy();

    const deleteBtn = getByText('Delete');
    fireEvent.click(deleteBtn);
    expect(handlePrimary).toHaveBeenCalledTimes(1);
  });
});
