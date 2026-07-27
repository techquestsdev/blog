import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import AsciiField from './AsciiField.svelte';

beforeEach(() => {
  // jsdom has no canvas 2D context; stub it so onMount doesn't throw.
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    scale: vi.fn(),
    fillStyle: '',
    font: ''
  }));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn() });
});

describe('AsciiField', () => {
  it('renders a decorative, non-interactive canvas', () => {
    const { container } = render(AsciiField);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });
});
