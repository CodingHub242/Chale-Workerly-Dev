import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimesheetDetailPage } from './timesheet-detail.page';

describe('TimesheetDetailPage', () => {
  let component: TimesheetDetailPage;
  let fixture: ComponentFixture<TimesheetDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
