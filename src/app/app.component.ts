import {Component, inject} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {environment} from 'src/environments/environment';
import {NavbarComponent} from '../app/shared/components/navbar/navbar.component';
import {DOCUMENT} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map, startWith} from 'rxjs';
import { LanguageService } from './core/services/language.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, NavbarComponent]
})
export class AppComponent{
public title = 'Credential-issuer-ui';
private readonly document = inject(DOCUMENT);
private readonly languageService = inject(LanguageService);
private readonly router= inject(Router);
public readonly showNavbar$ = toSignal(this.router.events.pipe(
  filter((event): event is NavigationEnd => event instanceof NavigationEnd),
  map((event: NavigationEnd) => !event.urlAfterRedirects.startsWith('/home')),
  startWith(!this.router.url.startsWith('/home'))
));

 ngOnInit(){
  this.languageService.setLanguage();
  this.setCustomColors();
  this.setFavicon();
 }

 private setCustomColors(){
  const root = document.documentElement;
  const colors = environment.customizations.colors;

  const cssVarMap = {
    '--primary-custom-color': colors.primary,
    '--primary-contrast-custom-color': colors.primary_contrast,
    '--secondary-custom-color': colors.secondary,
    '--secondary-contrast-custom-color': colors.secondary_contrast,
  };

  Object.entries(cssVarMap).forEach(([cssVariable, colorValue]) => {
    root.style.setProperty(cssVariable, colorValue);
  });
 }

 private setFavicon(): void {
  const faviconSrc = environment.customizations.favicon_src;

  // load favicon from environment
  const faviconLink: HTMLLinkElement = this.document.querySelector("link[rel='icon']") || this.document.createElement('link');
  faviconLink.type = 'image/x-icon';
  faviconLink.rel = 'icon';
  faviconLink.href = 'assets/icons/' + faviconSrc;

  this.document.head.appendChild(faviconLink);

  // load apple-touch icon from environment
  const appleFaviconLink: HTMLLinkElement = this.document.querySelector("link[rel='apple-touch-icon']") || this.document.createElement('link');
  appleFaviconLink.type = 'image/x-icon';
  appleFaviconLink.rel = 'apple-touch-icon';
  appleFaviconLink.href = 'assets/icons/' + faviconSrc;

  this.document.head.appendChild(appleFaviconLink);
}


}
