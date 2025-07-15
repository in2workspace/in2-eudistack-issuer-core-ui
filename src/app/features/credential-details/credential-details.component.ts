import { CustomTooltipDirective } from './../../shared/directives/custom-tooltip.directive';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AbstractControl, FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CapitalizePipe } from 'src/app/shared/pipes/capitalize.pipe';
import { AddPrefixPipe } from 'src/app/shared/pipes/add-prefix.pipe';
import { CredentialDetailsService } from './services/credential-details.service';
import { environment } from 'src/environments/environment';
import { KNOWLEDGEBASE_PATH } from 'src/app/core/constants/knowledge.constants';


@Component({
  standalone: true,
  imports: [AddPrefixPipe, CapitalizePipe, CommonModule, CustomTooltipDirective, FormsModule, MatButton, MatCard, MatCardContent, MatFormField, MatIcon, MatInput, MatLabel, MatSlideToggle, ReactiveFormsModule, RouterLink, TranslatePipe ],
  providers:[CredentialDetailsService],
  selector: 'app-credential-details',
  templateUrl: './credential-details.component.html',
  styleUrl: './credential-details.component.scss'
})
export class CredentialDetailsComponent implements OnInit {
  
  private readonly detailsService = inject(CredentialDetailsService);
  private readonly loader = inject(LoaderService);
  private readonly route = inject(ActivatedRoute);

  //signals
  public credentialValidFrom$ = this.detailsService.credentialValidFrom$;
  public credentialValidUntil$ = this.detailsService.credentialValidUntil$;
  public credentialType$ = this.detailsService.credentialType$;
  public lifeCycleStatus$ = this.detailsService.lifeCycleStatus$;
  public lifeCycleStatusClass$ = this.detailsService.lifeCycleStatusClass$;
  public credentialStatus$ = this.detailsService.credentialStatus$;
  public credentialDetailsForm$ = this.detailsService.credentialDetailsForm$;
  public credentialDetailsFormSchema$ = this.detailsService.credentialDetailsFormSchema$;
  public tooltipText: string = "credentialDetails.revokeTooltip";
  public knowledgeBaseUrl = environment.knowledge_base_url + KNOWLEDGEBASE_PATH.ISSUER + KNOWLEDGEBASE_PATH.ISSUER_REVOKATION;

  public showReminderButton$ = computed(() => {
    return (
      (
        this.lifeCycleStatus$() === 'WITHDRAWN' ||
        this.lifeCycleStatus$() === 'DRAFT' ||
        this.lifeCycleStatus$() === 'PEND_DOWNLOAD'
      ) &&
      this.credentialType$() === 'LEARCredentialEmployee'
    );
  });

  public showSignCredentialButton$ = computed(()=>{
    return (this.lifeCycleStatus$() === 'PEND_SIGNATURE') && 
    (this.credentialType$() === 'LEARCredentialEmployee' || this.credentialType$() === 'VerifiableCertification');
  });

  public showRevokeCredentialButton$ = computed(() => {
    return this.lifeCycleStatus$() === 'VALID';
  });

  public enableRevokeCredentialButton$ = computed(() => {
    return !!this.credentialStatus$();
  });

  public showActionsButtonsContainer$ = computed<boolean>(() => {
    return this.showSignCredentialButton$() || this.showReminderButton$() || this.showRevokeCredentialButton$()
  });

  //observables
  public isLoading$ = this.loader.isLoading$;

  public ngOnInit(): void {
    this.getProcedureId();
    this.initializeForm();
  }

  //SEND REMINDER
  public openSendReminderDialog(){
    this.detailsService.openSendReminderDialog();
  }

  // SIGN
  public openSignCredentialDialog(){
    this.detailsService.openSignCredentialDialog();
  }

  // REVOKE
  public openRevokeCredentialDialog(){
    this.detailsService.openRevokeCredentialDialog();
  }

  //TEMPLATE FUNCTIONS
  public formKeys(group: AbstractControl | null | undefined): string[] {
    if (group instanceof FormGroup) {
      return Object.keys(group.controls);
    }
    return [];
  }
  
  public getControlType(control: AbstractControl | null | undefined): 'group' | 'control' {
    if (control instanceof FormGroup) {
      return 'group';
    }
    return 'control';
  }

  public asFormArray(control: AbstractControl | null): FormArray {
    return control as FormArray;
  }

  private getProcedureId(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.detailsService.setProcedureId(id);
  }
  

  private loadCredentialDetailsAndForm(): void {
    this.detailsService.loadCredentialDetailsAndForm();
  }

  private initializeForm(): void {
    this.loadCredentialDetailsAndForm();
  }
  

}
