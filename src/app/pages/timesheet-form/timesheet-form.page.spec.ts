import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimesheetFormPage } from './timesheet-form.page';

describe('TimesheetFormPage', () => {
  let component: TimesheetFormPage;
  let fixture: ComponentFixture<TimesheetFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
