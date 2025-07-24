import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempFormPage } from './temp-form.page';

describe('TempFormPage', () => {
  let component: TempFormPage;
  let fixture: ComponentFixture<TempFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TempFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
