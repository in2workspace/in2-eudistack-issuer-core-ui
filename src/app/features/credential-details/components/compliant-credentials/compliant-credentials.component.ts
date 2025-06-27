import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CompliantCredential } from './../../../../core/models/entity/lear-credential';
import { AfterViewInit, Component, inject, InjectionToken, OnInit, ViewChild } from '@angular/core';

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
export class CompliantCredentialsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatSort) public sort!: MatSort;

  public data: CompliantCredential[] = inject(compliantCredentialsToken);
  public dataSource: MatTableDataSource<CompliantCredential> = new MatTableDataSource(this.data);
  public displayedColumns: string[] = ['id', 'type', "gx:digestSRI"];

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
