import { Component, effect, EventEmitter, inject, Output, Signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { KeyGeneratorService } from '../../services/key-generator.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { KeyState } from 'src/app/core/models/entity/lear-credential-issuance';

@Component({
  selector: 'app-key-generator',
  standalone: true,
  imports: [KeyValuePipe, MatButton, MatIcon, MatTooltip, TranslatePipe],
  providers: [KeyGeneratorService],
  templateUrl: './key-generator.component.html',
  styleUrl: './key-generator.component.scss'
})
export class KeyGeneratorComponent {
  @Output() public updateKeys = new EventEmitter<KeyState | undefined>();
  public keyState$: Signal<KeyState | undefined>;
  public displayedKeys$: Signal<Partial<KeyState> | undefined>;
  public copiedKey = "";
  private readonly keyService = inject(KeyGeneratorService);
  private readonly emitOnKeysChange = effect(() => {
    this.updateKeys.emit(this.keyState$());
  });

  public constructor(){
    this.keyState$ = this.keyService.getState();
    this.displayedKeys$ = this.keyService.displayedKeys$;
  }

  public async generateKeys(): Promise<void>{
    await this.keyService.generateP256();
  }

  public copyToClipboard(text:string): void{
    navigator.clipboard.writeText(text);
    this.copiedKey = text;
    setTimeout(() => this.resetCopiedKey(), 2000);
  }

  public resetCopiedKey(): void{
    this.copiedKey = "";
  }
}
