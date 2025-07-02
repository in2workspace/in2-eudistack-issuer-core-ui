import { Component, computed, input, Signal } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSelect } from '@angular/material/select';
import { AddAsteriskDirective } from 'src/app/shared/directives/add-asterisk.directive';
import { CredentialIssuanceFormFieldSchema } from 'src/app/core/models/entity/lear-credential-issuance';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [AddAsteriskDirective, ReactiveFormsModule, MatCard, 
        MatCard,
        MatCardContent,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        TranslatePipe
  ],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss'
})
export class DynamicFieldComponent {
  public fieldSchema$ = input.required<CredentialIssuanceFormFieldSchema>();
  public abstractControl$ = input.required<AbstractControl>();
  public fieldName$ = input.required<string>();


  public parentFormGroup$: Signal<FormGroup<any>> = computed(() => this.abstractControl$() as FormGroup);
  
  public control$: Signal<FormControl<any> | null> = computed(() => {
    if(this.fieldSchema$().type === 'group') return null;

    const parent = this.parentFormGroup$();
    return parent ? parent.get(this.fieldName$()) as FormControl | null : null;
  });
  
  public group$: Signal<FormGroup<any> | null> = computed(() => {
    if(this.fieldSchema$().type === 'control') return null;

    const parent = this.parentFormGroup$();
    return parent ? parent.get(this.fieldName$()) as FormGroup | null : null;
  });

  public getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) return "";
    const err = Object.values(control.errors)[0];
    const defaultLabel = err.value;
    return defaultLabel;
  }

  public getErrorsArgs(control: AbstractControl | null): Record<string, string> {
    if (!control || !control.errors) return {};
    const err = Object.values(control.errors)[0];
    const args = err.args as [];
    let translateParams = {};
    if(args && args.length > 0){
      args.forEach((arg, i) => {
        translateParams = { ...translateParams, [i]: arg }
      });
    }
    return translateParams;
  }

  

}

