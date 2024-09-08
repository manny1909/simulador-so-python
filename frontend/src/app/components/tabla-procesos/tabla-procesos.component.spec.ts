import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaProcesosComponent } from './tabla-procesos.component';

describe('TablaProcesosComponent', () => {
  let component: TablaProcesosComponent;
  let fixture: ComponentFixture<TablaProcesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaProcesosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablaProcesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
