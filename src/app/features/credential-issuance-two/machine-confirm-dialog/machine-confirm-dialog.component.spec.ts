import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineConfirmDialogComponent } from './machine-confirm-dialog.component';

describe('MachineConfirmDialogComponent', () => {
  let component: MachineConfirmDialogComponent;
  let fixture: ComponentFixture<MachineConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachineConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
