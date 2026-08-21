const RUNES = {
  evolving: { glyph: '⟳', label: 'evolving' },
  shipped: { glyph: '✓', label: 'shipped' },
  archived: { glyph: '☾', label: 'archived' }
};

export function statusRune(status) {
  if (!status) return null;
  return RUNES[status] ?? null;
}
