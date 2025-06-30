import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { By } from '@angular/platform-browser';
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
    expect(component.dataSource).not.toBeNull();
    expect(component.dataSource!.data).toEqual(defaultData);
  });

  it('should have the correct displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['id', 'type', 'gx:digestSRI']);
  });

  it('should set paginator and sort on the dataSource after view init', () => {
    expect(component.paginator).toBeInstanceOf(MatPaginator);
    expect(component.sort).toBeInstanceOf(MatSort);
    expect(component.dataSource!.paginator).toBe(component.paginator);
    expect(component.dataSource!.sort).toBe(component.sort);
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
      expect(component.dataSource).not.toBeNull();
      expect(component.dataSource!.data).toEqual(customData);
    });

    it('should still set paginator and sort on the new dataSource', () => {
      expect(component.paginator).toBeInstanceOf(MatPaginator);
      expect(component.sort).toBeInstanceOf(MatSort);
      expect(component.dataSource!.paginator).toBe(component.paginator);
      expect(component.dataSource!.sort).toBe(component.sort);
    });
  });

  describe('when there is no data (empty array)', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CompliantCredentialsComponent, NoopAnimationsModule],
        providers: [
          { provide: compliantCredentialsToken, useValue: [] }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CompliantCredentialsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have an empty dataSource', () => {
      expect(component.dataSource).not.toBeNull();
      expect(component.dataSource!.data).toEqual([]);
    });

    it('should not render the table or paginator in the DOM', () => {
      const tableEl = fixture.debugElement.query(By.css('table'));
      const paginatorEl = fixture.debugElement.query(By.directive(MatPaginator));
      expect(tableEl).toBeNull();
      expect(paginatorEl).toBeNull();
    });

    it('should render the fallback no-data div with "-"', () => {
      const noDataEl = fixture.debugElement.query(By.css('.no-data'));
      expect(noDataEl).toBeTruthy();
      expect(noDataEl.nativeElement.textContent.trim()).toBe('-');
    });

    it('should have undefined paginator and sort ViewChilds', () => {
      expect(component.paginator).toBeUndefined();
      expect(component.sort).toBeUndefined();
    });
  });

  describe('when injected data is null', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CompliantCredentialsComponent, NoopAnimationsModule],
        providers: [
          { provide: compliantCredentialsToken, useValue: null }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CompliantCredentialsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have null data and no dataSource', () => {
      expect(component.data).toBeNull();
      expect(component.dataSource).toBeNull();
    });

    it('should not render the table or paginator in the DOM', () => {
      const tableEl = fixture.debugElement.query(By.css('table'));
      const paginatorEl = fixture.debugElement.query(By.directive(MatPaginator));
      expect(tableEl).toBeNull();
      expect(paginatorEl).toBeNull();
    });

    it('should render the fallback no-data div with "-"', () => {
      const noDataEl = fixture.debugElement.query(By.css('.no-data'));
      expect(noDataEl).toBeTruthy();
      expect(noDataEl.nativeElement.textContent.trim()).toBe('-');
    });

    it('should have undefined paginator and sort ViewChilds', () => {
      expect(component.paginator).toBeUndefined();
      expect(component.sort).toBeUndefined();
    });
  });
});
