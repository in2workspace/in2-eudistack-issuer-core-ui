import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { QRCodeModule } from 'angularx-qrcode';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [QRCodeModule, TranslatePipe],
})
export class HomeComponent{
  @ViewChild('loginSection') loginSection!: ElementRef<HTMLElement>;
  @ViewChild('header') header!: ElementRef;
  public readonly walletUrl = environment.wallet_url ?? '';
  public readonly knowledge_base_url = environment.knowledge_base_url.base;
  public readonly logoSrc = environment.customizations.assets.base_url + "/" + environment.customizations.assets.logo_path;
  public readonly licenseUrl = environment.license_url;
  public readonly privacyPolicyUrl = environment.privacy_policy_url;
  public readonly codeRepositoryUrl = environment.code_repository_url;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public login() {
    this.authService.login();
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // we use content wrapper as reference because we need space for navbar
public scrollToLoginSection(): void {
  // The navbar uses position: fixed, so its height overlaps the target section.
  // We calculate the section's absolute position and subtract the navbar height
  // to ensure the section becomes fully visible below the fixed header.
  const element = this.loginSection.nativeElement;
  const rect = element.getBoundingClientRect();

  const navbarHeight = this.header.nativeElement.offsetHeight;
  console.log('navbar h: ' + navbarHeight);

  const top = rect.top + window.scrollY - navbarHeight;

  window.scrollTo({
    top,
    behavior: 'smooth'
  });
}

}
