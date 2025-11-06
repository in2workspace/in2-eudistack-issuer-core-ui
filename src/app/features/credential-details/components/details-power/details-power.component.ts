import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CapitalizePipe } from './../../../../shared/pipes/capitalize.pipe';
import { Component, inject, InjectionToken } from '@angular/core';
import { FunctionActions } from '../../helpers/credential-details-helpers';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

export const detailsPowerToken = new InjectionToken<FunctionActions[]>('DETAILS_POWER');

@Component({
  selector: 'app-details-power',
  standalone: true,
  imports: [CapitalizePipe, MatSlideToggle, TranslatePipe],
  templateUrl: './details-power.component.html',
  styleUrl: './details-power.component.scss'
})
export class DetailsPowerComponent {
  public powers: FunctionActions[] = inject(detailsPowerToken);
  public sysTenant: string = environment.sys_tenant;

}
