import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { triggerBurst } from '$lib/js/ascii-burst.js';

export const userTheme = browser && localStorage.getItem('color-scheme');

export const theme = writable(userTheme ?? 'dark');

export function toggleTheme() {
  theme.update((currentTheme) => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('color-scheme', newTheme);
    localStorage.setItem('color-scheme', newTheme);

    return newTheme;
  });
}

export function toggleThemeWithBurst(e) {
  toggleTheme();
  triggerBurst(e.clientX, e.clientY);
}

export function setTheme(newTheme) {
  theme.set(newTheme);
}
