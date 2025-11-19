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
  public walletUrl = environment.wallet_url ?? '';
  public knowledge_base_url = environment.knowledge_base_url;
  public readonly logoSrc = "../../../assets/logos/" + environment.customizations.logo_src;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public login() {
    this.authService.login();
  }

  public logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  public scrollToLoginSection(): void {
    this.loginSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

}
