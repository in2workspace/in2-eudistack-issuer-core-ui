import { of, Subject } from 'rxjs';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CustomTooltipDirective } from './custom-tooltip.directive';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button
      [appCustomTooltip]="'TOOLTIPS.CLICK_LINK'"
      [tooltipParams]="{ url: testUrl }"
      [appCustomTooltipDisabled]="disabled"
    >Hover me</button>
  `,
  imports: [CustomTooltipDirective]
})
class TestHostComponent {
  testUrl = 'https://test-url.com/';
  disabled = false;
}

describe('CustomTooltipDirective (jest)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let translate: TranslateService;
  let hostDe: DebugElement;
  let directive: CustomTooltipDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [TranslateModule.forRoot(), CustomTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    translate = TestBed.inject(TranslateService);
    hostDe = fixture.debugElement.query(By.directive(CustomTooltipDirective));
    directive = hostDe.injector.get(CustomTooltipDirective);

    translate.setTranslation('en', {
      TOOLTIPS: {
        CLICK_LINK: "Click <a href='{{url}}' target='_blank'>here</a> for details."
      }
    });
    translate.use('en');

    fixture.detectChanges();
  });

  it('should not show tooltip when disabled', fakeAsync(() => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    hostDe.triggerEventHandler('mouseenter', {});
    tick();
    fixture.detectChanges();

    const tt = Array.from(document.body.children)
      .find(el => el.textContent?.includes('Click'));
    expect(tt).toBeUndefined();
  }));

  it('should create and remove tooltip via private methods', fakeAsync(() => {
    const removeSpy = jest.spyOn(directive['renderer'], 'removeChild');
    (directive as any).currentTranslation = 'TEST';
    directive['showTooltip']();
    expect(directive['tooltipElement']).toBeTruthy();
    expect((directive['tooltipElement'] as HTMLElement).innerHTML).toBe('TEST');

    directive['hideTooltip']();
    expect(removeSpy).toHaveBeenCalledWith(document.body, expect.any(HTMLElement));
    expect(directive['tooltipElement']).toBeNull();
  }));

  it('should update content on language change', fakeAsync(() => {
    const langChange$ = new Subject<LangChangeEvent>();
    jest.spyOn(translate, 'onLangChange', 'get').mockReturnValue(langChange$ as any);

    const getSpy = jest.spyOn(translate, 'get')
      .mockReturnValueOnce(of('FIRST'))
      .mockReturnValueOnce(of('SECOND'));

    hostDe.triggerEventHandler('mouseenter', {});
    tick();
    fixture.detectChanges();

    let ttEl = Array.from(document.body.children)
      .find(el => el.textContent?.includes('FIRST')) as HTMLElement;
    expect(ttEl).toBeDefined();

    langChange$.next({ lang: 'es', translations: {} } as any);
    tick();
    fixture.detectChanges();

    ttEl = Array.from(document.body.children)
      .find(el => el.textContent?.includes('SECOND')) as HTMLElement;
    expect(ttEl).toBeDefined();
    expect(getSpy).toHaveBeenCalledTimes(2);
  }));

  it('should clean up timeouts and subscriptions on destroy', fakeAsync(() => {
    hostDe.triggerEventHandler('mouseenter', {});
    hostDe.triggerEventHandler('mouseleave', {});
    tick(50);

    const unsubSpy = jest.spyOn(directive as any, 'unsubscribeTranslation');
    directive.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  }));

  it('should hide tooltip immediately on tooltip mouseleave', fakeAsync(() => {
    hostDe.triggerEventHandler('mouseenter', {});
    tick();
    fixture.detectChanges();

    const tooltipEl = Array.from(document.body.children)
      .find(el => el.textContent?.includes('Click')) as HTMLElement;
    expect(tooltipEl).toBeDefined();

    tooltipEl.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    tick();
    fixture.detectChanges();

    expect(document.body.contains(tooltipEl)).toBeFalsy();
  }));
});
