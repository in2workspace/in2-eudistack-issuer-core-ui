import { IssuanceFormPowerSchema } from './../../../core/models/entity/lear-credential-issuance-schemas';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AuthService } from "../../../core/services/auth.service";
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe, KeyValuePipe } from '@angular/common';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { NormalizedAction } from './power-two.service';
import { tap } from 'rxjs';
import { RawFormPower } from '../credential-issuance-two/credential-issuance-two.component';

export interface TempIssuanceFormPowerSchema extends IssuanceFormPowerSchema{
  isDisabled: boolean;
}

export interface NormalizedTempIssuanceFormSchemaPower extends TempIssuanceFormPowerSchema{
  normalizedActions: NormalizedAction[];
}




@Component({
    selector: 'app-power-two',
    templateUrl: './power-two.component.html',
    styleUrls: ['./power-two.component.scss'],
    standalone: true,
    imports: [KeyValuePipe, ReactiveFormsModule, NgIf, MatFormField, MatSelect, MatSelectTrigger, MatOption, MatButton, NgFor, NgTemplateOutlet, MatSlideToggle, FormsModule, MatMiniFabButton, MatIcon, MatLabel, MatSelect, AsyncPipe, TranslatePipe]
})
export class PowerTwoComponent implements OnInit{
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  public organizationIdentifierIsIn2: boolean = this.authService.hasIn2OrganizationIdentifier();
  public _powersInput: IssuanceFormPowerSchema[] = [];
  public selectorPowers: TempIssuanceFormPowerSchema[] = [];
  public selectedPower: TempIssuanceFormPowerSchema | undefined;
  public form: FormGroup = new FormGroup({});


 @Output() formChanges = new EventEmitter<{value:RawFormPower, isValid:boolean}>();
 @Input()
  set powersInput(value: IssuanceFormPowerSchema[]) {
    console.error('Power component received empty list.');
    this._powersInput = value || [];
    this.selectorPowers = this.mapToTempPowerSchema(value) || [];
    this.resetForm();
  }

  public mapToTempPowerSchema(powers: IssuanceFormPowerSchema[]): TempIssuanceFormPowerSchema[]{
    return powers
      .map(p => ({...p, isDisabled: false}))
      .filter(p => this.organizationIdentifierIsIn2 || !p.isIn2Required);
  }

  public addPower(funcName: string) {
    // update form
    const power = this._powersInput.find(p => p.function === funcName);
    const actions = power?.action;
    if(!actions){
      console.error('No actions for this power');
      return;
    }
    const toggleGroup: Record<string, FormControl> = {};
    for (const action of actions) {
      toggleGroup[action] = new FormControl(false);
    }
    this.form.addControl(funcName, new FormGroup(toggleGroup));
    //update available powers
    this.selectorPowers = [...this.selectorPowers.map(p => {
      if(p.function === funcName){
        p = { ...p, isDisabled: true}
      }
      return p;
    })];
    //reset selected
    this.selectedPower = undefined;
  }

  public removePower(funcName: string): void {
    
  if (this.form.contains(funcName)) {
    this.form.removeControl(funcName);
  }

  this.selectorPowers = this.selectorPowers.map(p => {
    if (p.function === funcName) {
      return { ...p, isDisabled: false };
    }
    return p;
  });
  }

  public ngOnInit(){
    //every time form changes, emit value and validity
    this.form.valueChanges.pipe(
      tap(
        (value: RawFormPower) => {
          //todo move in one function
          const functions = Object.values(this.form.controls);
          const hasOneFunction = functions.length > 0;
            const allHaveAtLeastOneTrue = functions.every(control =>
            Object.values(control.value).some(v => v === true)
          );
          const powerIsValid = hasOneFunction && allHaveAtLeastOneTrue && this.form.valid;
          this.formChanges.emit({ value, isValid: powerIsValid });
        }
      )
    ).subscribe(val=>{
      console.log('powers value changed: ');
      console.log(val)
    });
  }

  private resetForm() {
    this.form.reset();            
    for (const key of Object.keys(this.form.controls)) {
      this.form.removeControl(key);
    }
  }


public submit(){
  console.log('submit: ');
  
}

// Mètode per obtenir un poder per la seva funció
public getPowerByFunction(functionName: string): TempIssuanceFormPowerSchema | undefined {
  return this.selectorPowers.find(p => p.function === functionName);
}

// Mètode per obtenir el FormGroup d'un control
public getFormGroup(control: any): FormGroup {
  return control as FormGroup;
}
  

}
