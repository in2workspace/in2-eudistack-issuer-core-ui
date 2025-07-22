import { Component, inject, OnInit, Signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { KeyGeneratorService } from '../../services/key-generator.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { KeyForm, KeyState } from 'src/app/core/models/entity/lear-credential-issuance';
import { IssuanceCustomFormChild } from 'src/app/features/credential-details/components/issuance-custom-form-child';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-key-generator',
  standalone: true,
  imports: [KeyValuePipe, MatButton, MatIcon, MatTooltip, TranslatePipe],
  providers: [KeyGeneratorService],
  templateUrl: './key-generator.component.html',
  styleUrl: './key-generator.component.scss'
})
export class KeyGeneratorComponent extends IssuanceCustomFormChild<FormGroup<KeyForm>> implements OnInit{
  public keyState$: Signal<KeyState | undefined>;
  public displayedKeys$: Signal<Partial<KeyState> | undefined>;
  public copiedKey = "";
  private readonly keyService = inject(KeyGeneratorService);
  private alertMessages = ["error.form.no_key"];

  public constructor(){
    super();
    this.keyState$ = this.keyService.getState();
    this.displayedKeys$ = this.keyService.displayedKeys$;
  }

  public ngOnInit(){
    this.updateAlertMessages(this.alertMessages);
  }

  public async generateKeys(): Promise<void>{
    await this.keyService.generateP256();
    this.form().patchValue({ didKey:this.keyState$()?.desmosDidKeyValue });
    this.updateAlertMessages(this.alertMessages)
  }

  public copyToClipboard(text:string): void{
    navigator.clipboard.writeText(text);
    this.copiedKey = text;
    setTimeout(() => this.resetCopiedKey(), 2000);
  }

  private resetCopiedKey(): void{
    this.copiedKey = "";
  }
}
