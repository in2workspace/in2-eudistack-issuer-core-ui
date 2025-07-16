import { AfterViewInit, Component, OnInit, inject, ViewChild, DestroyRef, ElementRef } from '@angular/core';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { CredentialProcedureService } from 'src/app/core/services/credential-procedure.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { CredentialProcedure, CredentialProceduresResponse } from "../../core/models/dto/credential-procedures-response.dto";
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass, DatePipe } from '@angular/common';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subject, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatIcon } from '@angular/material/icon';
import { CredentialProcedureWithClass } from 'src/app/core/models/entity/lear-credential-management';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';

import { SubjectComponent } from './components/subject-component/subject-component.component';

@Component({
    selector: 'app-credential-management',
    templateUrl: './credential-management.component.html',
    styleUrls: ['./credential-management.component.scss'],
    standalone: true,
    imports: [
        MatButton,
        MatButtonModule,
        MatTable,
        MatSort,
        MatColumnDef,
        MatFormField,
        MatHeaderCellDef,
        MatHeaderCell,
        MatIcon,
        MatInputModule,
        MatLabel,
        MatSortHeader,
        MatCellDef,
        MatCell,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        NgClass,
        MatPaginator,
        DatePipe,
        SubjectComponent,
        TranslatePipe,
    ],
    animations: [
      trigger('openClose', [
        state(
          'open',
          style({
            width: '200px',
            opacity: 1,
          })
        ),
        state(
          'closed',
          style({
            width: '0px',
            opacity: 0,
          })
        ),
        transition('open => closed', [animate('0.2s')]),
        transition('closed => open', [animate('0.2s')]),
      ]),
    ],
})
export class CredentialManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) public paginator!: MatPaginator;
  @ViewChild(MatSort) public sort!: MatSort;
  @ViewChild('searchInput') public searchInput!: ElementRef<HTMLInputElement>;
  public displayedColumns: string[] = ['subject', 'credential_type', 'updated','status'];
  public dataSource = new MatTableDataSource<CredentialProcedureWithClass>();
  public isValidOrganizationIdentifier = false;

  public hideSearchBar: boolean = true;


  private readonly authService = inject(AuthService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly statusService = inject(LifeCycleStatusService);

  private readonly searchSubject = new Subject<string>();

  public ngOnInit() {
    this.isValidOrganizationIdentifier = this.authService.hasIn2OrganizationIdentifier();
    this.loadCredentialData();

    this.searchSubject.pipe(debounceTime(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.dataSource.filter = searchValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: CredentialProcedure, property: string) => {
      switch (property) {
        case 'status': {
          const status = item.credential_procedure.status.toLowerCase();
          return status === 'withdrawn' ? 'draft' : status;
        }
        case 'subject': {
          return item.credential_procedure.subject.toLowerCase();
        }
        case 'updated': {
          return item.credential_procedure.updated.toLowerCase();
        }
        case 'credential_type': {
          return item.credential_procedure.credential_type.toLowerCase();
        }
        default:
          return '';
      }
    };

    this.dataSource.filterPredicate = (data: CredentialProcedure, filter: string) => {
      const searchString = filter.trim().toLowerCase();
      return data.credential_procedure.subject.toLowerCase().includes(searchString);
    };
  }

  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    this.searchSubject.next(filterValue);
  }

  public loadCredentialData(): void {
    this.credentialProcedureService.getCredentialProcedures()
    .pipe(take(1))
    .subscribe({
      next: (data: CredentialProceduresResponse) => {
        this.dataSource.data = this.statusService.addStatusClass(data.credential_procedures);
      },
      error: (error) => {
        console.error('Error fetching credentials for table', error);
      }
    });
  }

  public navigateToCreateCredential(): void {
    this.router.navigate(['/organization/credentials/create']);
  }

  public navigateToCreateCredentialAsSigner(): void {
    const route = this.isValidOrganizationIdentifier
      ? ['/organization/credentials/create-as-signer']
      : ['/organization/credentials/create'];
  
    this.router.navigate(route);
  }
  

  public onRowClick(row: CredentialProcedure): void {
    this.navigateToCredentialDetails(row);
  }

  public navigateToCredentialDetails(credential_procedures: CredentialProcedure): void {
    this.router.navigate([
      '/organization/credentials/details',
      credential_procedures.credential_procedure?.procedure_id
    ]);
  }

  public toggleSearchBar(){
    this.hideSearchBar = !this.hideSearchBar;

    if (this.hideSearchBar) {

      this.searchSubject.next('');
      
      if (this.searchInput) {
        this.searchInput.nativeElement.value = '';
      }
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

}
