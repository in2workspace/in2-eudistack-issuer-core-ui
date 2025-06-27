import { MatCard, MatCardContent } from '@angular/material/card';
import { Component, computed, inject, Injector, OnInit, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { PortalModule } from '@angular/cdk/portal';
import { CredentialStatus } from 'src/app/core/models/entity/lear-credential';
import { Observable } from 'rxjs';
import { credentialTypeHasSendReminderButton, credentialTypeHasSignCredentialButton, statusHasSendReminderlButton, statusHasSignCredentialButton } from './helpers/actions-helpers';
import { DetailsCredentialType, MappedExtendedDetailsField } from 'src/app/core/models/entity/lear-credential-details';


@Component({
  standalone: true,
  imports: [AddPrefixPipe, CapitalizePipe, CommonModule, FormsModule, MatButton, MatCard, MatCardContent, MatFormField, MatIcon, MatInput, MatLabel, MatSlideToggle, PortalModule, ReactiveFormsModule, RouterLink, TranslatePipe ],
  providers:[CredentialDetailsService],
  selector: 'app-credential-details',
  templateUrl: './credential-details.component.html',
  styleUrl: './credential-details.component.scss'
})
export class CredentialDetailsComponent implements OnInit {
  
  //signals
  public credentialValidFrom$: WritableSignal<string>;
  public credentialValidUntil$: WritableSignal<string>
  public credentialType$: WritableSignal<DetailsCredentialType | undefined>;
  public credentialStatus$: WritableSignal<CredentialStatus | undefined>
  public mainTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined>; // credentialSubject data
  public sideTemplateModel$: WritableSignal<MappedExtendedDetailsField[] | undefined>;
  public showSideTemplateCard$ = computed<boolean>(() =>
    Boolean(this.sideTemplateModel$()?.length)
);
 
  public showReminderButton$ = computed<boolean>(() => {
    const type = this.credentialType$();
    const status = this.credentialStatus$();

    return !!(
      status 
      && statusHasSendReminderlButton(status)
      && type 
      && credentialTypeHasSendReminderButton(type)
    );
  });
  
  public showSignCredentialButton$ = computed<boolean>(()=>{
    const type = this.credentialType$();
    const status = this.credentialStatus$();

    return !!(
      status
      && statusHasSignCredentialButton(status)
      && type 
      && credentialTypeHasSignCredentialButton(type)
    );
  });
  
  //observables
  public isLoading$: Observable<boolean>;

  private readonly detailsService = inject(CredentialDetailsService);
  private readonly injector = inject(Injector);
  private readonly loader = inject(LoaderService);
  private readonly route = inject(ActivatedRoute);

  public constructor(){
    this.isLoading$ = this.loader.isLoading$;
    this.credentialValidFrom$ = this.detailsService.credentialValidFrom$;
    this.credentialValidUntil$ = this.detailsService.credentialValidUntil$;
    this.credentialType$ = this.detailsService.credentialType$;
    this.credentialStatus$ = this.detailsService.credentialStatus$;
    this.mainTemplateModel$ = this.detailsService.mainTemplateModel$;
    this.sideTemplateModel$= this.detailsService.sideTemplateModel$;
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
  
  private getProcedureId(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.detailsService.setProcedureId(id);
  }

  private loadTemplateModel(): void {
    this.detailsService.loadCredentialModels(this.injector);
  }

}
