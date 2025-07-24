import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimesheetsPage } from './timesheets.page';

describe('TimesheetsPage', () => {
  let component: TimesheetsPage;
  let fixture: ComponentFixture<TimesheetsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
