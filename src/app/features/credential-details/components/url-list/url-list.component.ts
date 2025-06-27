import { InjectionToken, inject, Component } from '@angular/core';

// Define a component-specific injection token for a list of URLs
export const URL_LIST_TOKEN = new InjectionToken<string[]>('URL_LIST_TOKEN');

@Component({
  standalone: true,
  selector: 'app-url-list',
  imports: [],
  // todo remove mock token
  providers: [{
    provide: URL_LIST_TOKEN,
    useValue: [
      'https://example.com',
      'https://angular.io',
      'https://openai.com'
    ],
  }],
  template: `
  <!-- todo -->
    <ul>
      @for(url of urls; track $index){
        <li>
          <a [href]="url" target="_blank" rel="noopener">{{ url }}</a>
        </li>
      }
    </ul>
  `
})
export class UrlListComponent {
  // Inject the URL list using the token
  urls = inject(URL_LIST_TOKEN);
}