import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearProcesoFormComponent } from './crear-proceso-form.component';

describe('CrearProcesoFormComponent', () => {
  let component: CrearProcesoFormComponent;
  let fixture: ComponentFixture<CrearProcesoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearProcesoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearProcesoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
