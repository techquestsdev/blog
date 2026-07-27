import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SectionLabel from './SectionLabel.svelte';

describe('SectionLabel', () => {
  it('renders the provided label text', () => {
    const { getByText } = render(SectionLabel, { props: { label: 'Quests' } });
    expect(getByText('Quests')).toBeTruthy();
  });
});
