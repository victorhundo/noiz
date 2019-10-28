import { TestBed } from '@angular/core/testing';

import { SuccessdialogService } from './successdialog.service';

describe('SuccessdialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SuccessdialogService = TestBed.get(SuccessdialogService);
    expect(service).toBeTruthy();
  });
});
