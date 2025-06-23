import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialIssuanceTwoComponent } from './credential-issuance-two.component';

describe('CredentialIssuanceTwoComponent', () => {
  let component: CredentialIssuanceTwoComponent;
  let fixture: ComponentFixture<CredentialIssuanceTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialIssuanceTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialIssuanceTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
