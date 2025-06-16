import { state } from '@angular/animations';
import { Component, effect, EventEmitter, inject, OnInit, Output, Signal } from '@angular/core';
import { KeyGeneratorService, KeyState } from '../key-generator.service';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-key-generator',
  standalone: true,
  imports: [KeyValuePipe],
  providers: [KeyGeneratorService],
  templateUrl: './key-generator.component.html',
  styleUrl: './key-generator.component.scss'
})
export class KeyGeneratorComponent {
  @Output() updateKeys = new EventEmitter<KeyState | undefined>();
  private keyService = inject(KeyGeneratorService);
  public keyState$: Signal<KeyState | undefined> = this.keyService.getState();
  public copiedKey = "";
  emitOnKeysChange = effect(() => {
    this.updateKeys.emit(this.keyState$());
  });

  public async generateKeys(){
    await this.keyService.generateP256();
    await this.keyService.generateSecp256k1();

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
