import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EletctionComponent } from './eletction.component';

describe('EletctionComponent', () => {
  let component: EletctionComponent;
  let fixture: ComponentFixture<EletctionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EletctionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EletctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
