import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { WrappedValidators } from '../validators/credential-issuance/issuance-wrapped-built-in-validators';

@Directive({
  selector: '[appAddAsterisk]',
  standalone: true
})
export class AddAsteriskDirective implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) controlName!: string;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const control = this.formGroup.get(this.controlName);
    if (!control) {
      console.warn(`Control '${this.controlName}' no encontrado en el FormGroup`);
      return;
    }

    // Angular 14+: AbstractControl.hasValidator(validatorFn) devuelve boolean
    const isRequired = control.errors?.['required'];

    if (isRequired) {
      // Creamos un nodo de texto con un espacio y el asterisco
      const text = this.renderer.createText(' *');
      this.renderer.appendChild(this.elementRef.nativeElement, text);
    }
  }
}
