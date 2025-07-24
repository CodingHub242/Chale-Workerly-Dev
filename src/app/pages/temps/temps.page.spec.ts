import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempsPage } from './temps.page';

describe('TempsPage', () => {
  let component: TempsPage;
  let fixture: ComponentFixture<TempsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TempsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
