import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogWrapperService } from 'src/app/shared/components/dialog/dialog-wrapper/dialog-wrapper.service';
import { Observable, of, switchMap, take, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogWrapperService);
  private readonly translate = inject(TranslateService);

  private executePolicy(tmfFunction: string, action: string, redirectUrl: string, authFlag: boolean = false): Observable<boolean> {
    if (this.authService.hasPower(tmfFunction, action)) {
      return of(true); 
    } else {
      const errorTitle = this.translate.instant(`error.policy.title`);
      const errorMessage = this.translate.instant(`error.policy.message`);
      
      const dialogRef = this.dialog.openErrorInfoDialog(errorMessage, errorTitle);
      return dialogRef.afterClosed().pipe(
        take(1),
        switchMap(() => authFlag ? this.authService.logout() : of(null)),
        switchMap(() => this.router.navigate([redirectUrl])),
        map(() => false) 
      );
    }
  }

  public checkOnboardingPolicy(): Observable<boolean> {
    return this.executePolicy('Onboarding', 'Execute', '/home', true);
  }

  public checkSettingsPolicy(): Observable<boolean> {
    
    return this.executePolicy('CredentialIssuer', 'Configure', '/organization/credentials');
  }
}
