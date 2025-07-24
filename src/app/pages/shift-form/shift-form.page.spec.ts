import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftFormPage } from './shift-form.page';

describe('ShiftFormPage', () => {
  let component: ShiftFormPage;
  let fixture: ComponentFixture<ShiftFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
