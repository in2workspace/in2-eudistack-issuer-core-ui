import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlListComponent } from './url-list.component';

describe('UrlListComponent', () => {
  let component: UrlListComponent;
  let fixture: ComponentFixture<UrlListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
