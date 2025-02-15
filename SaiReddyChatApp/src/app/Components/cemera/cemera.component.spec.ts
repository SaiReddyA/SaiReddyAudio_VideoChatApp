import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CemeraComponent } from './cemera.component';

describe('CemeraComponent', () => {
  let component: CemeraComponent;
  let fixture: ComponentFixture<CemeraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CemeraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CemeraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
