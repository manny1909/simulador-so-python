import { inject, Injectable } from '@angular/core';
import { Proceso } from '../models/classes/proceso';
import { MemoriaService } from './memoria.service';

@Injectable({
  providedIn: 'root'
})
export class ProcesadorService {

  private readonly _memoriaService = inject(MemoriaService)
  constructor() { }

  ejecutar(proceso: Proceso) {
    const listaEspacios = this._memoriaService.memoria.flatMap((value, index, array) => {
      const aux = value.filter(x => x.processChunk !== undefined && x.processChunk.idProceso == proceso.id)
      value = aux.map(x=> ({ ...x, processChunk: undefined }))
      return aux ? value : []
    }).map(x=> x.processChunk)
    listaEspacios.forEach(chunk=> {
      if (chunk) {
        proceso.contadorProceso = chunk.chunkIndex
        chunk.chunkSize
        proceso.pendingSize -= chunk.chunkSize
        proceso.pendingSize = proceso.pendingSize<0 ? 0 : proceso.pendingSize
        proceso.estado = proceso.pendingSize<=0 ? 'terminado' : proceso.estado
      }
    })
  }
}
