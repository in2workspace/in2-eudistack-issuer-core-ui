import { Component, effect, EventEmitter, inject, Output, Signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { KeyGeneratorService, KeyState } from '../../services/key-generator.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-key-generator',
  standalone: true,
  imports: [KeyValuePipe, TranslatePipe, MatButton, MatIcon],
  providers: [KeyGeneratorService],
  templateUrl: './key-generator.component.html',
  styleUrl: './key-generator.component.scss'
})
export class KeyGeneratorComponent {
  @Output() updateKeys = new EventEmitter<KeyState | undefined>();
  private keyService = inject(KeyGeneratorService);
  public keyState$: Signal<KeyState | undefined> = this.keyService.getState();
  public displayedKeys$: Signal<Partial<KeyState> | undefined> = this.keyService.displayedKeys$;
  public copiedKey = "";
  emitOnKeysChange = effect(() => {
    this.updateKeys.emit(this.keyState$());
  });

  public async generateKeys(){
    await this.keyService.generateP256();
  }

  public copyToClipboard(text:string){
    navigator.clipboard.writeText(text);
    this.copiedKey = text;
    setTimeout(() => this.resetCopiedKey(), 2000);
  }

  public resetCopiedKey(){
    this.copiedKey = "";
  }
}
