import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Modal } from './Modal';
import { Dialog } from './Dialog';

describe('Modal & Dialog Primitive Deep Contract', () => {
  it('renders modal title, body content, and dialog role when visible is true', () => {
    const handleClose = vi.fn();
    const { getByText, getByRole } = render(
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
    expect(getByRole('dialog')).toBeTruthy();
  });

  it('renders nothing when visible is false', () => {
    const handleClose = vi.fn();
    const { queryByText, queryByRole } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Modal visible={false} onRequestClose={handleClose} title="Hidden Modal">
            <Text>Hidden Body</Text>
          </Modal>
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(queryByText('Hidden Modal')).toBeNull();
    expect(queryByRole('dialog')).toBeNull();
  });

  it('triggers primaryAction and secondaryAction in Dialog component', () => {
    const handleClose = vi.fn();
    const handlePrimary = vi.fn();
    const handleSecondary = vi.fn();

    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Dialog
            visible={true}
            onRequestClose={handleClose}
            title="Confirm Delete"
            description="This action cannot be undone."
            primaryAction={{ label: 'Delete Permanently', onPress: handlePrimary, variant: 'danger' }}
            secondaryAction={{ label: 'Cancel', onPress: handleSecondary }}
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Confirm Delete')).toBeTruthy();
    expect(getByText('This action cannot be undone.')).toBeTruthy();

    const cancelBtn = getByText('Cancel');
    fireEvent.click(cancelBtn);
    expect(handleSecondary).toHaveBeenCalledTimes(1);

    const deleteBtn = getByText('Delete Permanently');
    fireEvent.click(deleteBtn);
    expect(handlePrimary).toHaveBeenCalledTimes(1);
  });
});
