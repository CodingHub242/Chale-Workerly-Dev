import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientFormPage } from './client-form.page';

describe('ClientFormPage', () => {
  let component: ClientFormPage;
  let fixture: ComponentFixture<ClientFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
