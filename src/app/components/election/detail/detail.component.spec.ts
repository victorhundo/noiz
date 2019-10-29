import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailElectionComponent } from './detail.component';

describe('DetailElectionComponent', () => {
  let component: DetailElectionComponent;
  let fixture: ComponentFixture<DetailElectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailElectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailElectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
