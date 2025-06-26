import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CompliantCredential } from './../../../../core/models/entity/lear-credential';
import { Component, inject, InjectionToken, OnInit } from '@angular/core';

export const compliantCredentialsToken = new InjectionToken<CompliantCredential[]>('COMPLIANT_CREDENTIALS_DATA');

@Component({
  selector: 'app-compliant-credentials',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule],
  templateUrl: './compliant-credentials.component.html',
  styleUrl: './compliant-credentials.component.scss'
})
export class CompliantCredentialsComponent implements OnInit {
  public data = inject(compliantCredentialsToken);
  public displayedColumns: string[] = ['id', 'type', "gx:digestSRI"];

  public ngOnInit(){
    console.log(this.data);
  }

}
