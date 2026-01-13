import { environment } from '../../../environments/environment';

const DEFAULT_THEME_BUNDLE = 'default-theme';
const THEME_LINK_ID = 'runtime-theme';

export function getInitialThemeBundleName(): string {
  return environment.customizations?.theme_bundle ?? DEFAULT_THEME_BUNDLE;
}

export function applyInitialTheme(): void {
    const initialBundle = getInitialThemeBundleName();
  applyThemeBundle(initialBundle);
}

export function applyThemeBundle(bundleName: string): void {
  const existing = document.getElementById(THEME_LINK_ID);
  existing?.remove();

  const link = document.createElement('link');
  link.id = THEME_LINK_ID;
  link.rel = 'stylesheet';

  const base = document.querySelector('base')?.getAttribute('href') ?? '/';
  link.href = `${base}${bundleName}.css`;

  document.head.appendChild(link);
}
