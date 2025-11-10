import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { mermaidRendered } from './stores.js';

describe('Stores', () => {
  describe('mermaidRendered', () => {
    it('should initialize with false', () => {
      const value = get(mermaidRendered);
      expect(value).toBe(false);
    });

    it('should be updatable', () => {
      mermaidRendered.set(true);
      const value = get(mermaidRendered);
      expect(value).toBe(true);

      // Reset for other tests
      mermaidRendered.set(false);
    });

    it('should support update function', () => {
      mermaidRendered.set(false);

      mermaidRendered.update((current) => !current);
      expect(get(mermaidRendered)).toBe(true);

      mermaidRendered.update((current) => !current);
      expect(get(mermaidRendered)).toBe(false);
    });

    it('should allow subscription', () => {
      let receivedValue;
      const unsubscribe = mermaidRendered.subscribe((value) => {
        receivedValue = value;
      });

      mermaidRendered.set(true);
      expect(receivedValue).toBe(true);

      mermaidRendered.set(false);
      expect(receivedValue).toBe(false);

      unsubscribe();
    });
  });
});
