import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalContainer from '../../src/components/modals/ModalContainer';

describe('ModalContainer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  it('should render nothing when isOpen is false', () => {
    render(<ModalContainer {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(<ModalContainer {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeTruthy();
    expect(screen.getByText('Modal content')).toBeTruthy();
  });

  it('should render title', () => {
    render(<ModalContainer {...defaultProps} title="My Title" />);

    expect(screen.getByText('My Title')).toBeTruthy();
  });

  it('should render subtitle when provided', () => {
    render(<ModalContainer {...defaultProps} subtitle="My Subtitle" />);

    expect(screen.getByText('My Subtitle')).toBeTruthy();
  });

  it('should not render subtitle when not provided', () => {
    render(<ModalContainer {...defaultProps} />);

    // Should only have title, not subtitle
    const header = screen.getByText('Test Modal').closest('div');
    expect(header.querySelectorAll('p').length).toBe(0);
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ModalContainer {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render children', () => {
    render(
      <ModalContainer {...defaultProps}>
        <button>Child Button</button>
        <p>Child paragraph</p>
      </ModalContainer>
    );

    expect(screen.getByText('Child Button')).toBeTruthy();
    expect(screen.getByText('Child paragraph')).toBeTruthy();
  });

  it('should use default blue header color', () => {
    render(<ModalContainer {...defaultProps} />);

    // The header with bg-blue-600 is the div containing the title
    const headerDiv = document.querySelector('.bg-blue-600');
    expect(headerDiv).toBeTruthy();
  });

  it('should use custom header color when provided', () => {
    render(<ModalContainer {...defaultProps} headerColor="bg-red-600" />);

    const headerDiv = document.querySelector('.bg-red-600');
    expect(headerDiv).toBeTruthy();
  });

  it('should have backdrop with blur effect', () => {
    render(<ModalContainer {...defaultProps} />);

    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeTruthy();
    expect(backdrop.className).toContain('bg-black/70');
    expect(backdrop.className).toContain('backdrop-blur-sm');
  });

  it('should have scrollable content area', () => {
    render(<ModalContainer {...defaultProps} />);

    const modal = document.querySelector('.max-h-\\[90vh\\]');
    expect(modal).toBeTruthy();
    expect(modal.className).toContain('overflow-y-auto');
  });
});
