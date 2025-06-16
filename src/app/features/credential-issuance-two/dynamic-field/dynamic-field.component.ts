import { FirstElementPipe } from './../../../shared/pipes/first-element.pipe';
import { Component, computed, effect, input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe, KeyValuePipe } from '@angular/common';
import { CredentialIssuanceFormFieldSchema } from 'src/app/core/models/entity/lear-credential-issuance-schemas';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [KeyValuePipe, NgIf, NgFor, AsyncPipe, FirstElementPipe, ReactiveFormsModule, MatCard, 
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
  templateUrl: './dynamic-field.component.html'
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

  getFirstErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors) return null;
  const firstKey = Object.keys(control.errors)[0];
  return control.errors[firstKey];
}
}

