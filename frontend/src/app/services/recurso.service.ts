import { Injectable } from '@angular/core';
import { IResource } from '../models/interfaces/resource';

@Injectable({
  providedIn: 'root'
})
export class RecursoService {
  recursos: IResource[] = [
    { recurso: 'memory', idProceso: undefined },
    { recurso: 'processor', idProceso: undefined },
    { recurso: 'hardDrive', idProceso: undefined },
    { recurso: 'graphicsCard', idProceso: undefined },
  ]
  constructor() { }
  recursosDisponibles(): boolean {
    return this.recursos.findIndex(x => !x.ocupado) != -1
  }
}
