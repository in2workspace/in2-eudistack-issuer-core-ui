import { CREDENTIAL_MANAGEMENT_ORGANIZATION } from './../../core/constants/translations.constants';
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
import { CredentialProcedureWithClass, Filter } from 'src/app/core/models/entity/lear-credential-management';
import { LifeCycleStatusService } from 'src/app/shared/services/life-cycle-status.service';

import { SubjectComponent } from './components/subject-component/subject-component.component';
import { MatRadioButton } from "@angular/material/radio";
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CREDENTIAL_MANAGEMENT_SUBJECT } from 'src/app/core/constants/translations.constants';



@Component({
    selector: 'app-credential-management',
    templateUrl: './credential-management.component.html',
    styleUrls: ['./credential-management.component.scss'],
    standalone: true,
    imports: [
    FormsModule,
    MatButton,
    MatButtonModule,
    MatCheckbox,
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
    MatRadioButton
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
  public isAdminOrganizationIdentifier = false;
  public isSearchByOrganizationFilterChecked = false;
  public searchLabel = CREDENTIAL_MANAGEMENT_SUBJECT;

  public hideSearchBar: boolean = true;


  private readonly authService = inject(AuthService);
  private readonly credentialProcedureService = inject(CredentialProcedureService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly statusService = inject(LifeCycleStatusService);
  private readonly searchSubject = new Subject<string>();

  public onFilterByOrgChange(isChecked: boolean): void{
    if(isChecked){
      this.searchLabel = CREDENTIAL_MANAGEMENT_ORGANIZATION;
    }else{
      this.searchLabel = CREDENTIAL_MANAGEMENT_SUBJECT;
    }
  }

  public ngOnInit() {
    this.isAdminOrganizationIdentifier = this.authService.hasIn2OrganizationIdentifier();
    this.initializeAdminFeatures(); //todo ngAfterViewInit?
    this.loadCredentialData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.setDataSortingAccessor();
    this.setFilterPredicate("subject");
    this.setSubjectSearch();
  }

  private initializeAdminFeatures(): void{
    if(this.isAdminOrganizationIdentifier){
      this.displayedColumns.push('organization');
    }
  }

  private setDataSortingAccessor(): void{
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
  }

  private setFilterPredicate(filter: Filter): void{
    //todo
      this.dataSource.filterPredicate = (data: CredentialProcedure, filter: string) => {
        const searchString = filter.trim().toLowerCase();
        return data.credential_procedure.subject.toLowerCase().includes(searchString);
    };
  }

  private setSubjectSearch(): void{
    this.searchSubject.pipe(debounceTime(500))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.dataSource.filter = searchValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
    });
  }

  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    this.searchSubject.next(filterValue);
  }

  private loadCredentialData(): void {
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

  //todo change "signer" for "admin" here and in all app
  public navigateToCreateCredentialAsSigner(): void {
    const route = this.isAdminOrganizationIdentifier
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
    const searchInputNativeEl = this.searchInput.nativeElement;

    if (this.hideSearchBar) {

      this.searchSubject.next('');
      
      if (this.searchInput) {
        searchInputNativeEl.value = '';
      }
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }else{
      searchInputNativeEl.focus();
      searchInputNativeEl.select();
    }
  }

}