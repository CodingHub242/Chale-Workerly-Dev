import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemploginPage } from './templogin.page';

describe('TemploginPage', () => {
  let component: TemploginPage;
  let fixture: ComponentFixture<TemploginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TemploginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
