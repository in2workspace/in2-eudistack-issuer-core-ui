import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// src/app/features/credential-details/components/compliant-credentials/compliant-credentials.component.spec.ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  CompliantCredentialsComponent,
  compliantCredentialsToken
} from './compliant-credentials.component';
import { CompliantCredential } from 'src/app/core/models/entity/lear-credential';

describe('CompliantCredentialsComponent', () => {
  let fixture: ComponentFixture<CompliantCredentialsComponent>;
  let component: CompliantCredentialsComponent;

  const defaultData: CompliantCredential[] = [
    { id: '1', type: 't1', 'gx:digestSRI': 's1' } as any,
    { id: '2', type: 't2', 'gx:digestSRI': 's2' } as any,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompliantCredentialsComponent, NoopAnimationsModule],
      providers: [
        { provide: compliantCredentialsToken, useValue: defaultData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompliantCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngAfterViewInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject the default data', () => {
    expect(component.data).toEqual(defaultData);
    expect(component.dataSource.data).toEqual(defaultData);
  });

  it('should have the correct displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['id', 'type', 'gx:digestSRI']);
  });

  it('should set paginator and sort on the dataSource after view init', () => {
    // ViewChild properties should be defined
    expect(component.paginator).toBeInstanceOf(MatPaginator);
    expect(component.sort).toBeInstanceOf(MatSort);

    // DataSource should have paginator and sort set
    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.dataSource.sort).toBe(component.sort);
  });

  describe('when overriding compliantCredentialsToken', () => {
    const customData: CompliantCredential[] = [
      { id: 'A', type: 'tx', 'gx:digestSRI': 'sx' } as any
    ];

    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CompliantCredentialsComponent, NoopAnimationsModule],
        providers: [
          { provide: compliantCredentialsToken, useValue: customData }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CompliantCredentialsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should inject the overridden data', () => {
      expect(component.data).toEqual(customData);
      expect(component.dataSource.data).toEqual(customData);
    });

    it('should still set paginator and sort on the new dataSource', () => {
      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });
  });
});
