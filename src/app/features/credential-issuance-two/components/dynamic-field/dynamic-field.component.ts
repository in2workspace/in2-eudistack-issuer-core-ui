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
  fieldSchema$ = input.required<CredentialIssuanceFormFieldSchema>();
  abstractControl$ = input.required<AbstractControl>();
  fieldName$ = input.required<string>();
  
  // logEffect = effect(()=>{
  //   console.log('fieldSchema');
  //   console.log(this.fieldSchema$());
  //   console.log('abstract');
  //   console.log(this.abstractControl$());
  //   console.log('fieldName');
  //   console.log(this.fieldName$());
  // });


  parentFormGroup$ = computed(() => this.abstractControl$() as FormGroup);
  
  control$ = computed(() => {
    const parent = this.parentFormGroup$();
    return parent ? parent.get(this.fieldName$()) as FormControl | null : null;
  });
  
  group$ = computed(() => {
    const parent = this.parentFormGroup$();
    return parent ? parent.get(this.fieldName$()) as FormGroup | null : null;
  });
  groupFields$ = computed(() =>
    Object.entries(((this.fieldSchema$().type === 'group') && (this.fieldSchema$().groupFields)) ?? {}).map(([key, value]) => ({
      key,
      value,
    }))
  );

  //todo no s'usa
  getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) return "";
    const err = Object.values(control.errors)[0];
    const defaultLabel = err.value;
    return defaultLabel;
  }

  getErrorsArgs(control: AbstractControl | null): Record<string, string> {
    if (!control || !control.errors) return {};
    const err = Object.values(control.errors)[0];
    const args = err.args as [];
    let translateParams = {};
    args.forEach((arg, i) => {
      translateParams = { ...translateParams, [i]: arg }
    });
    return translateParams;
  }

  

}

