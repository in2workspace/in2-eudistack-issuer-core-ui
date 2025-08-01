import { Directive, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

// This class is extended by Issuance Form custom children components
// We use a directive instead of a component because it requires less boilerplate + is more flexible
@Directive()
export abstract class BaseIssuanceCustomFormChild<T extends AbstractControl = AbstractControl> {
  public readonly data = input<any>(); 
  public readonly form = input.required<T>();
}

