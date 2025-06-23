import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredentialIssuanceComponent } from './credential-issuance.component';


describe('CredentialIssuanceComponent', () => {
  let component: CredentialIssuanceComponent;
  let fixture: ComponentFixture<CredentialIssuanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialIssuanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialIssuanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
