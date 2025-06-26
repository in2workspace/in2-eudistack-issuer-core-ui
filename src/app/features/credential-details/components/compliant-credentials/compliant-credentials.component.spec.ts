import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompliantCredentialsComponent } from './compliant-credentials.component';

describe('CompliantCredentialsComponent', () => {
  let component: CompliantCredentialsComponent;
  let fixture: ComponentFixture<CompliantCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompliantCredentialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompliantCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
