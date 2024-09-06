import { Injectable, signal } from '@angular/core';
import { Proceso } from '../models/classes/proceso';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  procesos = signal<Proceso[]>(new Array())
  constructor() { }
}
