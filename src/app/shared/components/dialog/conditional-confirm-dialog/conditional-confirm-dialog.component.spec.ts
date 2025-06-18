import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalConfirmDialogComponent } from './conditional-confirm-dialog.component';

describe('ConditionalConfirmDialogComponent', () => {
  let component: ConditionalConfirmDialogComponent;
  let fixture: ComponentFixture<ConditionalConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConditionalConfirmDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConditionalConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
