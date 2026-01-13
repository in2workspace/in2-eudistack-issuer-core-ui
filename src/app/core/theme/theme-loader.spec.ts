import * as runtimeTheme from './theme-loader';

// Mock the Angular environment import used by the module under test.
jest.mock('../../../environments/environment', () => ({
  environment: {
    customizations: undefined,
  },
}));

import { environment } from '../../../environments/environment';
import { applyInitialTheme } from './theme-loader';

describe('runtime theme functions', () => {
  const THEME_LINK_ID = 'runtime-theme';

  beforeEach(() => {
    // Clean DOM between tests.
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    // Reset mocked environment to default state.
    (environment as any).customizations = undefined;
    jest.restoreAllMocks();
  });

  describe('getInitialThemeBundleName', () => {
    it('returns default-theme when environment.customizations is undefined', () => {
      expect(runtimeTheme.getInitialThemeBundleName()).toBe('default-theme');
    });

    it('returns default-theme when environment.customizations.theme_bundle is undefined', () => {
      (environment as any).customizations = {};
      expect(runtimeTheme.getInitialThemeBundleName()).toBe('default-theme');
    });

    it('returns the configured theme_bundle when present', () => {
      (environment as any).customizations = { theme_bundle: 'my-theme' };
      expect(runtimeTheme.getInitialThemeBundleName()).toBe('my-theme');
    });

    it('returns empty string if theme_bundle is an empty string (no fallback)', () => {
      (environment as any).customizations = { theme_bundle: '' };
      expect(runtimeTheme.getInitialThemeBundleName()).toBe('');
    });
  });

  describe('applyInitialTheme', () => {
    it('applies default-theme when no customization exists', () => {
      applyInitialTheme();

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/default-theme.css');
    });

    it('applies environment custom theme_bundle when provided', () => {
      (environment as any).customizations = { theme_bundle: 'bundle-x' };

      applyInitialTheme();

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/bundle-x.css');
    });

    it('uses <base href> when present', () => {
      (environment as any).customizations = { theme_bundle: 'bundle-x' };

      const base = document.createElement('base');
      base.setAttribute('href', '/app/');
      document.head.appendChild(base);

      applyInitialTheme();

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/app/bundle-x.css');
    });
  });

  describe('applyThemeBundle', () => {
    it('creates a <link> with correct id/rel and appends it to <head>', () => {
      // base href not present => fallback to "/"
      runtimeTheme.applyThemeBundle('default-theme');

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.id).toBe(THEME_LINK_ID);
      expect(link!.rel).toBe('stylesheet');
      expect(link!.getAttribute('href')).toBe('/default-theme.css');
    });

    it('uses <base href> when present', () => {
      const base = document.createElement('base');
      base.setAttribute('href', '/app/');
      document.head.appendChild(base);

      runtimeTheme.applyThemeBundle('my-theme');

      const link = document.head.querySelector<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(link).not.toBeNull();
      expect(link!.getAttribute('href')).toBe('/app/my-theme.css');
    });

    it('removes an existing theme link before adding the new one', () => {
      const existing = document.createElement('link');
      existing.id = THEME_LINK_ID;
      existing.rel = 'stylesheet';
      existing.href = '/old.css';
      document.head.appendChild(existing);

      expect(document.head.querySelectorAll(`link#${THEME_LINK_ID}`).length).toBe(1);

      runtimeTheme.applyThemeBundle('new-theme');

      const links = document.head.querySelectorAll<HTMLLinkElement>(`link#${THEME_LINK_ID}`);
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('href')).toBe('/new-theme.css');
      expect(Array.from(links).some((l) => l.getAttribute('href') === '/old.css')).toBe(false);
    });

    it('handles missing <head> state by still appending correctly (sanity)', () => {
      // In JSDOM, document.head exists; this test mainly ensures no exception.
      expect(() => runtimeTheme.applyThemeBundle('abc')).not.toThrow();
      expect(document.getElementById(THEME_LINK_ID)).not.toBeNull();
    });
  });
});
