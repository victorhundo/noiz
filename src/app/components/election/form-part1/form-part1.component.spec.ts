import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPart1Component } from './form-part1.component';

describe('FormPart1Component', () => {
  let component: FormPart1Component;
  let fixture: ComponentFixture<FormPart1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPart1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPart1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
