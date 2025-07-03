import { DialogComponent } from 'src/app/shared/components/dialog/dialog-component/dialog.component';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { KeyValuePipe } from '@angular/common';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { EMPTY, Observable, tap } from 'rxjs';
import { DialogData } from 'src/app/shared/components/dialog/dialog-data';
import { AuthService } from 'src/app/core/services/auth.service';
import { IssuanceFormPowerSchema, IssuanceRawPowerForm } from 'src/app/core/models/entity/lear-credential-issuance';

export interface TempIssuanceFormPowerSchema extends IssuanceFormPowerSchema{
  isDisabled: boolean;
}

export interface NormalizedTempIssuanceFormSchemaPower extends TempIssuanceFormPowerSchema{
  normalizedActions: NormalizedAction[];
}

export type NormalizedAction = { action: string; value: boolean };

export interface IssuancePowerValueAndValidity {
  value: IssuanceRawPowerForm, 
  hasOnePower: boolean, 
  hasOneActionPerPower: boolean
}

@Component({
    selector: 'app-issuance-power',
    templateUrl: './issuance-power.component.html',
    styleUrls: ['./issuance-power.component.scss'],
    standalone: true,
    imports: [KeyValuePipe, ReactiveFormsModule, MatFormField, MatSelect, MatSelectTrigger, MatOption, MatButton, MatSlideToggle, FormsModule, MatMiniFabButton, MatIcon, MatLabel, MatSelect, TranslatePipe]
})
export class IssuancePowerComponent implements OnInit{
  @Output() public formChanges = new EventEmitter<IssuancePowerValueAndValidity>();

  public organizationIdentifierIsIn2: boolean;
  public _powersInput: IssuanceFormPowerSchema[] = [];
  public selectorPowers: TempIssuanceFormPowerSchema[] = [];
  public selectedPower: TempIssuanceFormPowerSchema | undefined;
  public form: FormGroup = new FormGroup({});

  private readonly authService = inject(AuthService);
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  public constructor(){
    this.organizationIdentifierIsIn2 = this.authService.hasIn2OrganizationIdentifier();
  }
  
  
  @Input()
  public set powersInput(value: IssuanceFormPowerSchema[]) {
    console.warn('Power component received empty list.');
    this._powersInput = value || [];
    this.selectorPowers = this.mapToTempPowerSchema(value) || [];
    this.resetForm();
  }

  //this makes keyvaluePipe respect the order
  public keepOrder = (_: any, _2: any) => 0;

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
    const dialogData: DialogData = {
        title: this.translate.instant("power.remove-dialog.title"),
        message: this.translate.instant("power.remove-dialog.message") + funcName,
        confirmationType: 'sync',
        status: `default`
    }
    const removeAfterClose =  (): Observable<any> => {
    if (this.form.contains(funcName)) {
          this.form.removeControl(funcName);
        }

    this.selectorPowers = this.selectorPowers.map(p => {
      if (p.function === funcName) {
        return { ...p, isDisabled: false };
      }
      return p;
    });
      return EMPTY;
    };
    this.dialog.openDialogWithCallback(DialogComponent, dialogData, removeAfterClose);
    
  }

  public ngOnInit(){
    //every time form changes, emit value and validity
    this.form.valueChanges.pipe(
      tap(
        (value: IssuanceRawPowerForm) => {
          //todo move in one function
          const functions = Object.values(this.form.controls);
          const hasOnePower = functions.length > 0;
          const hasOneActionPerPower = functions.every(control =>
            Object.values(control.value).some(v => v === true)
          );
          this.formChanges.emit({ value, hasOnePower, hasOneActionPerPower });
        }
      )
    ).subscribe();
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

  private mapToTempPowerSchema(powers: IssuanceFormPowerSchema[]): TempIssuanceFormPowerSchema[]{
    return powers
      .map(p => ({...p, isDisabled: false}))
      .filter(p => this.organizationIdentifierIsIn2 || !p.isIn2Required);
  }

  private resetForm() {
    this.form.reset();            
    for (const key of Object.keys(this.form.controls)) {
      this.form.removeControl(key);
    }
  }
  

}
