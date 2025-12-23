import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftReportsPage } from './shift-reports.page';

describe('ShiftReportsPage', () => {
  let component: ShiftReportsPage;
  let fixture: ComponentFixture<ShiftReportsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
