import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTest } from './employee-test';

describe('EmployeeTest', () => {
  let component: EmployeeTest;
  let fixture: ComponentFixture<EmployeeTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
