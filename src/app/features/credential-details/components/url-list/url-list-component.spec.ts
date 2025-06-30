// src/app/url-list/url-list.component.spec.ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UrlListComponent, URL_LIST_TOKEN } from './url-list.component';

describe('UrlListComponent', () => {
  let fixture: ComponentFixture<UrlListComponent>;
  let component: UrlListComponent;
  let el: HTMLElement;

  const defaultUrls = [
    'https://example.com',
    'https://angular.io',
    'https://openai.com'
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlListComponent],
      providers: [{
        provide: URL_LIST_TOKEN,
        useValue: defaultUrls,
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UrlListComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the default urls injected', () => {
    expect(component.urls).toEqual(defaultUrls);
  });

  it('should render one <li> per URL', () => {
    const items = el.querySelectorAll('ul > li');
    expect(items.length).toBe(defaultUrls.length);
  });

  it('should render each URL as an <a> with correct href and text', () => {
    const anchors = Array.from(el.querySelectorAll('ul > li > a'));
    anchors.forEach((a, idx) => {
      expect(a.textContent).toBe(defaultUrls[idx]);
      expect(a.getAttribute('href')).toBe(defaultUrls[idx]);
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener');
    });
  });

  describe('when overriding URL_LIST_TOKEN', () => {
    const customUrls = ['https://foo.com', 'https://bar.com'];

    beforeEach(async () => {
      // Re-configure testing module and override the component's providers
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UrlListComponent],
      })
      .overrideComponent(UrlListComponent, {
        set: {
          providers: [
            { provide: URL_LIST_TOKEN, useValue: customUrls }
          ]
        }
      })
      .compileComponents();

      fixture = TestBed.createComponent(UrlListComponent);
      component = fixture.componentInstance;
      el = fixture.nativeElement;
      fixture.detectChanges();
    });

    it('should inject the overridden urls', () => {
      expect(component.urls).toEqual(customUrls);
    });

    it('should render the overridden urls in the template', () => {
      const anchors = Array.from(el.querySelectorAll('ul > li > a'));
      expect(anchors.length).toBe(customUrls.length);
      anchors.forEach((a, idx) => {
        expect(a.textContent).toBe(customUrls[idx]);
        expect(a.getAttribute('href')).toBe(customUrls[idx]);
      });
    });
  });
});
