import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comprobantes } from './comprobantes';

describe('Comprobantes', () => {
  let component: Comprobantes;
  let fixture: ComponentFixture<Comprobantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comprobantes],
    }).compileComponents();

    fixture = TestBed.createComponent(Comprobantes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
