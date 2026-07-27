function stripFrontmatter(text) {
  return text.replace(/^﻿?---[\s\S]*?---/, '');
}

export function countWords(text) {
  if (!text) return 0;
  return stripFrontmatter(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function readingJourney(text, wpm = 200) {
  const minutes = Math.max(1, Math.ceil(countWords(text) / wpm));
  return `~${minutes} min journey`;
}
