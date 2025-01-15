import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoriaSecundariaComponent } from './memoria-secundaria.component';

describe('MemoriaSecundariaComponent', () => {
  let component: MemoriaSecundariaComponent;
  let fixture: ComponentFixture<MemoriaSecundariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoriaSecundariaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MemoriaSecundariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
