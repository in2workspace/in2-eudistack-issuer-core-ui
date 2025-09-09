import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormGroup } from '@angular/forms';

// This adds an asterisk, which is useful to indicate that a field in a form is mandatory
@Directive({
  selector: '[appAddAsterisk]',
  standalone: true
})
export class AddAsteriskDirective implements OnInit {
  @Input({ required: true }) public formGroup!: FormGroup;
  @Input({ required: true }) public controlName!: string;

  public constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2
  ) {}

  public ngOnInit(): void {
    const control = this.formGroup.get(this.controlName);
    if (!control) {
      console.warn(`Control '${this.controlName}' not found in FormGroup`);
      return;
    }

    const isRequired = control.errors?.['required'];

    if (isRequired) {
      const text = this.renderer.createText(' *');
      this.renderer.appendChild(this.elementRef.nativeElement, text);
    }
  }
}
