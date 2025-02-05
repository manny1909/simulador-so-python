import { Component, inject } from '@angular/core';
import { MemoriaService } from '../../services/memoria.service';
import { IMemoria } from '../../models/interfaces/memoria';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-memoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memoria.component.html',
  styleUrl: './memoria.component.scss'
})
export class MemoriaComponent {
  readonly _memoriaService = inject(MemoriaService)
  constructor(){
  }
}
