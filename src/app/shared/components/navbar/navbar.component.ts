import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: true,
    imports: [RouterLink, MatIcon, MatMenuModule, MatButtonModule, TranslatePipe],
})
export class NavbarComponent implements OnInit {
  public userName: string = '';
  public organization: string = '';
  public selectedLanguage = 'en';
  public isMenuOpen:boolean = false;
  public readonly logoSrc= environment.customizations.images.base_url + "/" + environment.customizations.images.logo_path;

  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  
  public ngOnInit() {
    this.authService.getMandator()
      .pipe(take(1))
      .subscribe(mandator => {
        if (mandator) {
          this.organization = mandator.organization
        }
      })
    this.authService.getName()
      .pipe(take(1))
      .subscribe(name => {
        if (name) {
          this.userName = name;
        }
      });
  }

  public logout() {
    this.authService.logout()
      .pipe(take(1))
      .subscribe(() => {
        sessionStorage.clear();
      });
  }

  public isCredentialIssuerAndConfigure():boolean {
    if(this.authService.hasPower('CredentialIssuer', 'Configure')) return true;
    return false;
  }

  //currently not used
  public changeLanguage(languageCode: string): void {
    this.translate.use(languageCode);
    this.selectedLanguage = languageCode;
  }
}
