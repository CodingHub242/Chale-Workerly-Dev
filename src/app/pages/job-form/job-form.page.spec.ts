import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobFormPage } from './job-form.page';

describe('JobFormPage', () => {
  let component: JobFormPage;
  let fixture: ComponentFixture<JobFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JobFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
