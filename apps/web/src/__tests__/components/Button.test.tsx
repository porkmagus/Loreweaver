import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders as disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    const btn = screen.getByRole('button', { name: /click/i });
    await btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
