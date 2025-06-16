import { IssuanceFormSchemaPower } from './../../../core/models/entity/lear-credential-issuance-schemas';
import { Component, OnInit, Signal, WritableSignal, computed, inject, input, signal } from '@angular/core';
import { AuthService } from "../../../core/services/auth.service";
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { NormalizedAction, PowerTwoService } from './power-two.service';
import { DialogData } from 'src/app/shared/components/dialog/dialog.component';
import { EMPTY, map, Observable, pairwise, scan } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

export interface TempIssuanceFormSchemaPower extends IssuanceFormSchemaPower{
  isDisabled?: boolean;
}

export interface NormalizedTempIssuanceFormSchemaPower extends TempIssuanceFormSchemaPower{
  normalizedActions: NormalizedAction[];
}


@Component({
    selector: 'app-power-two',
    templateUrl: './power-two.component.html',
    styleUrls: ['./power-two.component.scss'],
    standalone: true,
    imports: [ReactiveFormsModule, NgIf, MatFormField, MatSelect, MatSelectTrigger, MatOption, MatButton, NgFor, NgTemplateOutlet, MatSlideToggle, FormsModule, MatMiniFabButton, MatIcon, MatLabel, MatSelect, AsyncPipe, TranslatePipe]
})
export class PowerTwoComponent implements OnInit{

  public organizationIdentifierIsIn2: boolean = false;
  
  //streams (form states)
  public _selectablePowers$: Signal<TempIssuanceFormSchemaPower[]> = input.required<TempIssuanceFormSchemaPower[]>();
  public selectedPower$: WritableSignal<TempIssuanceFormSchemaPower | undefined> = signal(undefined);
  public addedPowers$: WritableSignal<TempIssuanceFormSchemaPower[]> = signal([]);
  // powers that can be selected in the selector
  public availablePowers$: Signal<TempIssuanceFormSchemaPower[] | undefined> = computed(() => { 
    if(!this.addedPowers$() || this.addedPowers$().length === 0) return this._selectablePowers$();
    const availablePowers = [...this._selectablePowers$().map(p => { 
      return this.addedPowers$().some(pow => pow.function === p.function) 
      ? {...p, isDisabled: true} 
      : p })
    ]
    console.log('available powers')
    console.log(availablePowers)
    return availablePowers
    ;
  });
  // used to build template
  public normalizedAddedPowers$: Signal<NormalizedTempIssuanceFormSchemaPower[]> = computed(()=>{ return this.normalizePowers(this.addedPowers$())});
  // model with initial values
  public rawPowersFormModel$: Signal<FormGroup> = computed(() => {
    return this.buildPowerFormModel(this.normalizedAddedPowers$());
  }, );
  public powersFormModel$ = toSignal(
    toObservable(this.rawPowersFormModel$).pipe(
      
      scan((acc, curr) => {
        console.log('acc and curr');
        console.log(acc)
        console.log(curr)
        return this.updatePowerFormModel(acc, curr);
      }, new FormGroup([])),
    ),
    { initialValue: new FormGroup([]) }
  );

  
  
  isAddDisabled$ = computed(()=>{
    return !this.selectedPower$() || this.isPowerDisabled(this.selectedPower$()!)
  });
  
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(DialogWrapperService);
  private powerService = inject(PowerTwoService);
  private readonly translate = inject(TranslateService);


public submit(){
  console.log('submit: ');
  console.log(this.powersFormModel$())
}
 public isPowerDisabled(power:IssuanceFormSchemaPower): boolean{
  return this.addedPowers$().some(p => p.function === power.function && p.action === power.action);
 }

 public normalizePowers(powers: TempIssuanceFormSchemaPower[]): NormalizedTempIssuanceFormSchemaPower[] {
  return this.powerService.normalizePowers(powers);
}
public buildPowerFormModel(powers: NormalizedTempIssuanceFormSchemaPower[]): FormGroup {
  return this.powerService.buildPowerFormModel(powers);
}

public updatePowerFormModel(prev:FormGroup, curr:FormGroup): FormGroup {
  return this.powerService.updatePowerFormModel(prev, curr);
}


  public ngOnInit(){
    this.organizationIdentifierIsIn2 = this.authService.hasIn2OrganizationIdentifier();
  }

  //todo no perdre canvis fets en afegir
  public addPower(): void {
    const selectedPower = this.selectedPower$();
    if(!selectedPower){
      console.error('Trying to add a power but there is no selected power');
      return;
    }
    this.selectedPower$.set(undefined);
    const currentAddedPowers = this.addedPowers$();
    this.addedPowers$?.set([...currentAddedPowers, selectedPower]);
  
  }

//todo no perdre canvis fets en eliminar
  public removePower(powerToRemove: TempIssuanceFormSchemaPower): void {
    const dialogData: DialogData = {
        title: this.translate.instant("power.remove-dialog.title"),
        message: this.translate.instant("power.remove-dialog.message") + powerToRemove,
        confirmationType: 'sync',
        status: `default`
    }

    const removeAfterClose =  (): Observable<any> => {
      const addedPowers = this.addedPowers$();
      const updatedAddedPowers = addedPowers.filter(p => p.function !== powerToRemove.function);
      this.addedPowers$.set([...updatedAddedPowers]);
      return EMPTY;
    };
    this.dialog.openDialogWithCallback(dialogData, removeAfterClose);
  }

  

}
