import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssignDrawerComponent } from './assign-drawer.component';

describe('AssignDrawerComponent', () => {
  let component: AssignDrawerComponent;
  let fixture: ComponentFixture<AssignDrawerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AssignDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
