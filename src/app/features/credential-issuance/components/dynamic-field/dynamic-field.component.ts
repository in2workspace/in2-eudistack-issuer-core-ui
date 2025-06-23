import { Component, computed, input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe, KeyValuePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSelect } from '@angular/material/select';
import { CredentialIssuanceFormFieldSchema } from 'src/app/core/models/schemas/lear-credential-issuance-schemas';
import { AddAsteriskDirective } from 'src/app/shared/directives/add-asterisk.directive';
import { FirstElementPipe } from 'src/app/shared/pipes/first-element.pipe';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [AddAsteriskDirective, KeyValuePipe, NgIf, NgFor, AsyncPipe, FirstElementPipe, ReactiveFormsModule, MatCard, 
        MatButton,
        MatCard,
        MatCardContent,
        MatError,
        MatFormField,
        MatIcon,
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


  public parentFormGroup$ = computed(() => this.abstractControl$() as FormGroup);
  
  public control$ = computed(() => {
    const parent = this.parentFormGroup$();
    return parent ? parent.get(this.fieldName$()) as FormControl | null : null;
  });
  
  public group$ = computed(() => {
    const parent = this.parentFormGroup$();
    return parent ? parent.get(this.fieldName$()) as FormGroup | null : null;
  });
  public groupFields$ = computed(() =>
    Object.entries(((this.fieldSchema$().type === 'group') && (this.fieldSchema$().groupFields)) ?? {}).map(([key, value]) => ({
      key,
      value,
    }))
  );


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

