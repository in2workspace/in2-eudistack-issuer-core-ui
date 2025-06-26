import { InjectionToken, inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define a component-specific injection token for a list of URLs
export const URL_LIST_TOKEN = new InjectionToken<string[]>('URL_LIST_TOKEN');

@Component({
  standalone: true,
  selector: 'app-url-list',
  imports: [],
  providers: [{
    provide: URL_LIST_TOKEN,
    useValue: [
      'https://example.com',
      'https://angular.io',
      'https://openai.com'
    ],
  }],
  template: `
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