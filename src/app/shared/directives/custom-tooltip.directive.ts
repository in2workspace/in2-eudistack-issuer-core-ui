import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  OnDestroy,
  inject
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCustomTooltip]',
  standalone: true
})
export class CustomTooltipDirective implements OnDestroy {
  @Input('appCustomTooltip') public tooltipKey: string = '';
  @Input() public tooltipParams: Record<string, string> = {};
  @Input() public appCustomTooltipDisabled = false;

  private tooltipElement: HTMLElement | null = null;
  private hideTimeout: any;
  private translationSubscription: Subscription | null = null;
  private langChangeSubscription: Subscription | null = null;
  private currentTranslation: string = '';
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);

@HostListener('mouseenter')
public onMouseEnter() {
  if (this.appCustomTooltipDisabled) {
    return;
  }
  if (!this.tooltipElement) {
    this.subscribeToTranslation();
    this.showTooltip();
  }
}

@HostListener('mouseleave')
public onMouseLeave() {
  if (this.appCustomTooltipDisabled) {
    return;
  }
  this.hideTimeout = setTimeout(() => {
    this.hideTooltip();
  }, 100);
}

  public ngOnDestroy() {
    this.unsubscribeTranslation();
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  private subscribeToTranslation() {
    this.translationSubscription = this.translate
      .get(this.tooltipKey, this.tooltipParams)
      .subscribe(translated => {
        this.currentTranslation = translated;
        if (this.tooltipElement) {
          this.tooltipElement.innerHTML = this.currentTranslation;
        }
      });

    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.translate.get(this.tooltipKey, this.tooltipParams).subscribe(translated => {
        this.currentTranslation = translated;
        if (this.tooltipElement) {
          this.tooltipElement.innerHTML = this.currentTranslation;
        }
      });
    });
  }

  private showTooltip() {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background', 'rgba(0, 0, 0, 0.8)');
    this.renderer.setStyle(this.tooltipElement, 'color', '#fff');
    this.renderer.setStyle(this.tooltipElement, 'padding', '6px 10px');
    this.renderer.setStyle(this.tooltipElement, 'borderRadius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'fontSize', '12px');
    this.renderer.setStyle(this.tooltipElement, 'maxWidth', '200px');
    this.renderer.setStyle(this.tooltipElement, 'zIndex', '1000');
    this.renderer.setStyle(this.tooltipElement, 'boxShadow', '0 2px 6px rgba(0,0,0,0.3)');

    this.tooltipElement!.innerHTML = this.currentTranslation;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const scrollPos = {
      top: window.scrollY,
      left: window.scrollX,
    };

    this.renderer.setStyle(
      this.tooltipElement,
      'top',
      `${hostPos.top + scrollPos.top - 40}px`
    );
    this.renderer.setStyle(
      this.tooltipElement,
      'left',
      `${hostPos.left + scrollPos.left}px`
    );

    this.renderer.listen(this.tooltipElement, 'mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
    });
    this.renderer.listen(this.tooltipElement, 'mouseleave', () => {
      this.hideTooltip();
    });

    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
    this.unsubscribeTranslation();
  }

  private unsubscribeTranslation() {
    this.translationSubscription?.unsubscribe();
    this.langChangeSubscription?.unsubscribe();
  }

}
