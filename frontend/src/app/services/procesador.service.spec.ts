import { TestBed } from '@angular/core/testing';

import { ProcesadorService } from './procesador.service';

describe('ProcesadorService', () => {
  let service: ProcesadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcesadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
