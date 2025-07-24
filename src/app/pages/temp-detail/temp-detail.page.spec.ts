import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempDetailPage } from './temp-detail.page';

describe('TempDetailPage', () => {
  let component: TempDetailPage;
  let fixture: ComponentFixture<TempDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TempDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
