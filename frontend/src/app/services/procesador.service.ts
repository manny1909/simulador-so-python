import { inject, Injectable } from '@angular/core';
import { Hilo, Proceso } from '../models/classes/proceso';
import { MemoriaService } from './memoria.service';
import { procesador } from '../models/classes/procesador';

@Injectable({
  providedIn: 'root'
})
export class ProcesadorService {

  procesadores: Array<procesador> = []
  numProcesadores:number = 4
  readonly _memoriaService = inject(MemoriaService)
  constructor() {
    for (let i = 0; i < this.numProcesadores; i++) {
      this.procesadores.push(new procesador(i))
    }
  }
  async ejecutar(proceso:Proceso){
    const esHilo = proceso instanceof Hilo
    let index = this.procesadores.findIndex(x=> (
      (esHilo && x.proceso instanceof Hilo && proceso.id == x.proceso.id && proceso.idHilo == x.proceso.idHilo)
      || x.proceso instanceof Proceso && x.proceso.id == proceso.id
    )
    // x.proceso?.id == proceso.id
  )
    if (index == -1) {
      debugger
      throw new Error('El proceso no está en el procesador')
    }
    const procesoEjecutado = await this.procesadores[index].ejecutar(proceso)
    const chunk = this.procesadores[index].chunk
    if (chunk) {
      this._memoriaService.remplazarChunk(chunk)
      proceso.contadorProceso++
      while(proceso && proceso.chunks && proceso.contadorProceso < proceso.chunks.length
        && proceso.chunks[proceso.contadorProceso] == undefined){
        proceso.contadorProceso++
      }
      proceso.registroInstrucciones = proceso.contadorProceso ?? 0
    }
    if (!procesoEjecutado) {
      throw new Error('proceso ejecutado fue undefined')
    }
    this.procesadores[index].setProceso(undefined)
    this.procesadores[index].idUltimoProcesoEjecutado = proceso.id
    return procesoEjecutado
  }
  liberar(proceso:Proceso){
    if (proceso instanceof Hilo) {
      this.procesadores.forEach(x=> {
        if (x.proceso instanceof Hilo && x.proceso.id == proceso.id && x.proceso.idHilo == proceso.idHilo) {
          x.liberar()
        }
      })
    } else if(proceso instanceof Proceso) {
      this.procesadores.forEach(x=> {
        if (x.proceso instanceof Hilo && x.proceso.id == proceso.id) {
          x.liberar()
        }
      })
    }
  }
}
