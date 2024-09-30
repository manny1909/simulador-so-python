import { Injectable } from '@angular/core';
import { IResource } from '../models/interfaces/resource';

@Injectable({
  providedIn: 'root'
})
export class RecursoService {
  recursos: IResource[] = [
    { recurso: 'memory', idProceso: undefined, ocupado: false },
    { recurso: 'processor', idProceso: undefined, ocupado: false },
    { recurso: 'hardDrive', idProceso: undefined, ocupado: false },
    { recurso: 'graphicsCard', idProceso: undefined, ocupado: false },
  ]
  constructor() { }
  recursosDisponibles(): boolean {
    return this.recursos.findIndex(x => !x.ocupado) != -1
  }
}
