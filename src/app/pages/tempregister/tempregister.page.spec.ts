import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempregisterPage } from './tempregister.page';

describe('TempregisterPage', () => {
  let component: TempregisterPage;
  let fixture: ComponentFixture<TempregisterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TempregisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
