import { CustomTooltipDirective } from './../../shared/directives/custom-tooltip.directive';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Component, inject, Injector, OnInit, Signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CapitalizePipe } from 'src/app/shared/pipes/capitalize.pipe';
import { AddPrefixPipe } from 'src/app/shared/pipes/add-prefix.pipe';
import { CredentialDetailsService } from './services/credential-details.service';
import { PortalModule } from '@angular/cdk/portal';
import { CredentialStatus, CredentialType, LifeCycleStatus } from 'src/app/core/models/entity/lear-credential';
import { Observable } from 'rxjs';
import { MappedExtendedDetailsField } from 'src/app/core/models/entity/lear-credential-details';
import { StatusClass } from 'src/app/core/models/entity/lear-credential-management';
import { KNOWLEDGEBASE_PATH } from 'src/app/core/constants/knowledge.constants';
import { environment } from 'src/environments/environment';


@Component({
  standalone: true,
  imports: [AddPrefixPipe, CapitalizePipe, CommonModule, CustomTooltipDirective, FormsModule, MatButton, MatCard, MatCardContent, MatFormField, MatIcon, MatInput, MatLabel, PortalModule, ReactiveFormsModule, RouterLink, TranslatePipe ],
  providers:[CredentialDetailsService],
  selector: 'app-credential-details',
  templateUrl: './credential-details.component.html',
  styleUrl: './credential-details.component.scss'
})
export class CredentialDetailsComponent implements OnInit {
  
  //SIGNALS
  //Credential data
  public credentialValidFrom$: Signal<string>;
  public credentialValidUntil$: Signal<string>
  public credentialType$: Signal<CredentialType | undefined>;
  public lifeCycleStatus$: Signal<LifeCycleStatus | undefined>;
  public lifeCycleStatusClass$: Signal<StatusClass | undefined>;
  public credentialStatus$: Signal<CredentialStatus | undefined>;
  //Models
  public mainTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined>; // credentialSubject data
  public sideTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined>;
  public showSideTemplateCard$: Signal<boolean>;
  // Buttons
  public showReminderButton$: Signal<boolean>;
  public showSignCredentialButton$: Signal<boolean>;
  public showRevokeCredentialButton$: Signal<boolean>;
  public enableRevokeCredentialButton$: Signal<boolean>;
  public showActionsButtonsContainer$: Signal<boolean>;
  
  //OBSERVABLES
  public isLoading$: Observable<boolean>;

  //RAW VARIABLES
  public tooltipText: string = "credentialDetails.revokeTooltip";
  public knowledgeBaseUrl = environment.knowledge_base_url + KNOWLEDGEBASE_PATH.ISSUER + KNOWLEDGEBASE_PATH.ISSUER_REVOKATION;

  private readonly detailsService = inject(CredentialDetailsService);
  private readonly injector = inject(Injector);
  private readonly loader = inject(LoaderService);
  private readonly route = inject(ActivatedRoute);

  public constructor(){
    this.isLoading$ = this.loader.isLoading$;
    this.credentialValidFrom$ = this.detailsService.credentialValidFrom$;
    this.credentialValidUntil$ = this.detailsService.credentialValidUntil$;
    this.credentialType$ = this.detailsService.credentialType$;
    this.lifeCycleStatus$ = this.detailsService.lifeCycleStatus$;
    this.lifeCycleStatusClass$ = this.detailsService.lifeCycleStatusClass$;
    this.credentialStatus$ = this.detailsService.credentialStatus$;
    this.mainTemplateModel$ = this.detailsService.mainTemplateModel$;
    this.sideTemplateModel$ = this.detailsService.sideTemplateModel$;
    this.showSideTemplateCard$ = this.detailsService.showSideTemplateCard$;
    this.showReminderButton$ = this.detailsService.showReminderButton$;
    this.showSignCredentialButton$ = this.detailsService.showSignCredentialButton$;
    this.showRevokeCredentialButton$ = this.detailsService.showRevokeCredentialButton$;
    this.enableRevokeCredentialButton$ = this.detailsService.enableRevokeCredentialButton$;
    this.showActionsButtonsContainer$ = this.detailsService.showActionsButtonsContainer$;
  }

  public ngOnInit(): void {
    this.getProcedureId();
    this.loadTemplateModel();
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
  
  // DATA FETCHING
  private getProcedureId(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.detailsService.setProcedureId(id);
  }

  private loadTemplateModel(): void {
    this.detailsService.loadCredentialModels(this.injector);
  }

}
