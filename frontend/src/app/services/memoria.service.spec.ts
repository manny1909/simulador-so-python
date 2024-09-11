import { TestBed } from '@angular/core/testing';

import { MemoriaService } from './memoria.service';

describe('MemoriaService', () => {
  let service: MemoriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemoriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
