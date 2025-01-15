import { Component, inject } from '@angular/core';
import { MemoriaService } from '../../services/memoria.service';
import { IMemoria } from '../../models/interfaces/memoria';

@Component({
  selector: 'app-memoria',
  standalone: true,
  imports: [],
  templateUrl: './memoria.component.html',
  styleUrl: './memoria.component.scss'
})
export class MemoriaComponent {
  readonly _memoriaService = inject(MemoriaService)
  memory: IMemoria[][] = []
  constructor(){
    this.memory = this._memoriaService.memoria
  }
}
