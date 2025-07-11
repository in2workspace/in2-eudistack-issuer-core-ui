import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CustomTooltipDirective } from './custom-tooltip.directive';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button
      [appCustomTooltip]="'TOOLTIPS.CLICK_LINK'"
      [tooltipParams]="{ url: testUrl }"
    >
      Hover me
    </button>
  `,
  imports: [CustomTooltipDirective]
})
class TestHostComponent {
  testUrl = 'https://test-url.com/';
}

describe('CustomTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [TranslateModule.forRoot(), CustomTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    translate = TestBed.inject(TranslateService);

    translate.setTranslation('en', {
      TOOLTIPS: {
        CLICK_LINK: "Click <a href='{{url}}' target='_blank'>here</a> for details."
      }
    });
    translate.use('en');

    fixture.detectChanges();
  });

  it('should create and display tooltip with correct link on mouseenter, and remove it on mouseleave', fakeAsync(() => {
    const buttonDebugElement = fixture.debugElement.query(By.css('button'));
    const buttonElement = buttonDebugElement.nativeElement as HTMLButtonElement;

    // Simular mouseenter
    buttonDebugElement.triggerEventHandler('mouseenter', {});
    tick(); // processa subscripcions
    fixture.detectChanges();

    // El tooltip ha d'estar creat en el document.body
    const tooltipElement = Array.from(document.body.children).find(
      el => el.textContent?.includes('Click')
    ) as HTMLElement | undefined;

    expect(tooltipElement).toBeDefined();
    expect(tooltipElement!.innerHTML).toContain('href="https://test-url.com/"');
    expect(tooltipElement!.innerHTML).toContain('Click');
    expect(tooltipElement!.querySelector('a')?.getAttribute('href')).toBe('https://test-url.com/');

    // Simular mouseleave
    buttonDebugElement.triggerEventHandler('mouseleave', {});
    tick(150); // superar el delay de 100ms
    fixture.detectChanges();

    // El tooltip ha de desaparèixer
    const tooltipStillPresent = Array.from(document.body.children).find(
      el => el.textContent?.includes('Click')
    );
    expect(tooltipStillPresent).toBeUndefined();
  }));
});
