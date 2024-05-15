import { Component } from '@angular/core';
//import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import {IonicModule, PopoverController} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { UserData } from '../interfaces/userData.interface';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-custom-qr',
  templateUrl: 'custom-qr.page.html',
  styleUrls: ['custom-qr.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, QRCodeModule],
})
export class CustomQRPage {
  userData: UserData = {
    name: 'John',
    surname: 'Doe',
    idDoc: '12345',
    job: 'Developer'
  }
  public userDataTextAreaValue: string ="";
  public qrdata : string = "";
  constructor(private authenticationService: AuthenticationService,
    private router: Router,) {
    this.userDataTextAreaValue = this.getUserDataString();
  }

  updateUserData() {
    console.log(this.userDataTextAreaValue);
  }

  generateQR() {

  }

  getUserDataString() {
    return JSON.stringify(this.userData, null, 2);
  }

  saveInfo() {
    
  }

  logout() {
    this.authenticationService.logout().subscribe(() => {
      this.router.navigate(['/'], {})
    });
  }

}
