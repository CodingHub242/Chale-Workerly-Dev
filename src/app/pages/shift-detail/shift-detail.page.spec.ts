import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftDetailPage } from './shift-detail.page';

describe('ShiftDetailPage', () => {
  let component: ShiftDetailPage;
  let fixture: ComponentFixture<ShiftDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
