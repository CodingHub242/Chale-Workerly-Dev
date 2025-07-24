import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceFormPage } from './invoice-form.page';

describe('InvoiceFormPage', () => {
  let component: InvoiceFormPage;
  let fixture: ComponentFixture<InvoiceFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
