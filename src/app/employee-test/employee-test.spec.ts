import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { EmployeeTest } from './employee-test';

describe('EmployeeTest', () => {
  let component: EmployeeTest;
  let fixture: ComponentFixture<EmployeeTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeTest],
      providers: [provideHttpClient()],
      schemas: [NO_ERRORS_SCHEMA],
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
