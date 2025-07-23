
import { MatButton } from '@angular/material/button';
import { MatLabel } from '@angular/material/form-field';
import { Component, inject, WritableSignal, HostListener, Signal } from '@angular/core';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe, KeyValuePipe, NgComponentOutlet, CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CanComponentDeactivate, CanDeactivateType } from 'src/app/core/guards/can-component-deactivate.guard';
import { CredentialIssuanceService } from '../../services/credential-issuance.service';
import { CredentialIssuanceViewModelSchema, IssuanceCredentialType, IssuanceStaticViewModel } from 'src/app/core/models/entity/lear-credential-issuance';

@Component({
  selector: 'app-credential-issuance',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, ReactiveFormsModule, DynamicFieldComponent, MatButton, MatCard, MatCardContent, MatFormField, MatLabel, MatOption, MatSelect, NgComponentOutlet, TitleCasePipe, TranslatePipe],
  templateUrl: './credential-issuance.component.html',
  styleUrl: './credential-issuance.component.scss'
})
export class CredentialIssuanceComponent implements CanDeactivate<CanComponentDeactivate>{
  
  //CREDENTIAL TYPE SELECTOR
  public readonly credentialTypesArr: Readonly<IssuanceCredentialType[]>;
  public selectedCredentialType$: WritableSignal<IssuanceCredentialType | undefined>;

  // FORM STATE
  public formSchema$: Signal<CredentialIssuanceViewModelSchema | null>;
  
  public staticData$: Signal<IssuanceStaticViewModel | null>;
  public form$: Signal <FormGroup<Record<string, FormGroup>>>;
  public formValue$: Signal<Record<string, any>>;
  public isFormValid$: Signal<boolean>;

  public asSigner$: WritableSignal<boolean>;
  public hasSubmitted$: WritableSignal<boolean>;

  public bottomAlertMessages$: WritableSignal<string[]>;


  private readonly issuanceService = inject(CredentialIssuanceService);
  private readonly route = inject(ActivatedRoute);

  public constructor(){
    const asSigner = this.route.snapshot.pathFromRoot
        .flatMap(r => r.url)
        .map(seg => seg.path)
        .includes('create-as-signer');
    this.issuanceService.asSigner$.set(asSigner);
    this.asSigner$ = this.issuanceService.asSigner$;
    this.hasSubmitted$ = this.issuanceService.hasSubmitted$;
    this.credentialTypesArr = this.issuanceService.credentialTypesArr;
    this.selectedCredentialType$ = this.issuanceService.selectedCredentialType$;
    this.formSchema$ = this.issuanceService.credentialFormSchema$;
    this.staticData$ = this.issuanceService.staticData$;
    this.form$ = this.issuanceService.form$;
    this.formValue$ = this.issuanceService.formValue$;
    this.isFormValid$ = this.issuanceService.isFormValid$;
    this.bottomAlertMessages$ = this.issuanceService.bottomAlertMessages$;
  }

  @HostListener('window:beforeunload', ['$event'])
  private unloadAlert($event: BeforeUnloadEvent): void{
    if(!this.canLeave()){
      const confirm = this.issuanceService.openLeaveConfirm();
      //todo maybe use event.returnValue
      if(!confirm) $event.preventDefault();
    }
  }

  public onTypeSelectionChange(selectedCredentialType: IssuanceCredentialType, select: MatSelect): void {
    this.issuanceService.updateSelectedType(selectedCredentialType, select);
  }

  public canLeave(): boolean{
    return this.issuanceService.canLeave();
  }

  public canDeactivate(): CanDeactivateType {
    return this.issuanceService.canDeactivate();
  }

  public onSubmit(): void {
    const isFormValid = this.isFormValid$();
    const formValue = this.formValue$();
    if (!isFormValid) {
      console.error('Invalid form: ');
      console.error(formValue);
      return;
    } 

    console.log('Form is valid');
    console.log(formValue);

    if(this.selectedCredentialType$() === 'LEARCredentialMachine'){
      this.issuanceService.openLEARCredentialMachineSubmitDialog();
    }else{
      this.issuanceService.openSubmitDialog();
    }
  }


}
