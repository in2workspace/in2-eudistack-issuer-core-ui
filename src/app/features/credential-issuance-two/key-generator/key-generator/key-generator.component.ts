import { state } from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { KeyGeneratorService } from '../key-generator.service';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-key-generator',
  standalone: true,
  imports: [KeyValuePipe],
  templateUrl: './key-generator.component.html',
  styleUrl: './key-generator.component.scss'
})
export class KeyGeneratorComponent implements OnInit {
  private keyService = inject(KeyGeneratorService);
  public keyState$ = this.keyService.getState();
  public copiedKey = "";

  public async ngOnInit(){
    await this.generateKeys();
  }
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
