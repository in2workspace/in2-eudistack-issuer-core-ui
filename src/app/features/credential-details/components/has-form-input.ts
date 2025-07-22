import { Directive, input, WritableSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive()
export abstract class HasFormInput<T extends AbstractControl = AbstractControl> {
   public readonly data = input<any>(); 
   public readonly form = input.required<T>();
   public readonly updateMessages = input.required<(messages:string[]) => void>();
}