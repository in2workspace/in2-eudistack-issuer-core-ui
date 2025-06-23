import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TempIssuanceFormPowerSchema, NormalizedTempIssuanceFormSchemaPower } from '../components/power/power.component';

export type NormalizedAction = { action: string; value: boolean };

@Injectable({
  providedIn: 'root'
})
export class PowerTwoService {

  private fb = inject(FormBuilder);

  constructor() { }

  public normalizePowers(powers: TempIssuanceFormPowerSchema[]): NormalizedTempIssuanceFormSchemaPower[] {
    const normalizedPowers = powers.map(p => {
      
      // aquest camp d'alguna manera també es normalitza
      const actions: string[] = Array.isArray(p.action) ? p.action : [p.action];
      const normalizedActions : NormalizedAction[]= actions.map(a => ({ action:a, value:false }))
      
      return {
        ...p,
        normalizedActions
      };
    });
    
    return normalizedPowers;
  }

  public buildPowerFormModel(powers: NormalizedTempIssuanceFormSchemaPower[]): FormGroup{
    const subFormGroups = Object.fromEntries(powers.map(p => [p.function, this.fb.group(Object.fromEntries(p.normalizedActions.map(a=>[a.action, a.value])))]));
    console.log('subFormGroup');
    console.log(subFormGroups);
    let form = new FormGroup([]) as any;
    try{
      form = this.fb.group(subFormGroups);
    }catch(err){
      console.error(err);
    }
    return form;
  }

public updatePowerFormModel(prev: FormGroup, curr: FormGroup): FormGroup {
  console.log('updatePowerFormModel')
  const updated = new FormGroup({});

  Object.keys(curr.controls).forEach(key => {
    console.log('iterated curr sub-fromgroup: ' + key);
    const currControl = curr.get(key);
    const prevControl = prev.get(key);

    if (currControl instanceof FormGroup && prevControl instanceof FormGroup) {
      // Copiem els valors dels controls interns si existeixen també a prev
      const updatedSubGroup = new FormGroup({});
      Object.keys(currControl.controls).forEach(subKey => {
        console.log('iterated curr control: ' + subKey);
        const currSubControl = currControl.get(subKey);
        const prevSubControl = prevControl.get(subKey);

        const newValue = prevSubControl instanceof FormControl
          ? prevSubControl.value
          : currSubControl?.value;
          console.log('added new value for  ' + subKey);
          console.log(newValue);

        updatedSubGroup.addControl(
          subKey,
          new FormControl(newValue, { nonNullable: true })
        );
      });
      updated.addControl(key, updatedSubGroup);
    } else {
      // Si no és un FormGroup, es copia tal com està a curr
      updated.addControl(key, currControl!);
    }
  });
  console.log('updaePowerFormModel returns: ');
  console.log(updated);
  return updated;
}


}
