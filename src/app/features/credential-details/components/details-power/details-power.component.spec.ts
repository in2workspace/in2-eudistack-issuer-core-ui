import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPowerComponent } from './details-power.component';

describe('DetailsPowerComponent', () => {
  let component: DetailsPowerComponent;
  let fixture: ComponentFixture<DetailsPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPowerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
