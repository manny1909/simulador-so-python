import { Proceso, ProcessChunk } from "./proceso"

export class procesador {
  id: number | undefined
  proceso: Proceso | undefined
  idUltimoProcesoEjecutado: number | undefined
  tiempoEnEjecucion: number = 800
  trama: number = 10
  chunk: ProcessChunk | undefined
  constructor(id?: number, proceso?: Proceso, idUltimoProcesoEjecutado?: number) {
    this.id = id
    this.proceso = proceso
    this.idUltimoProcesoEjecutado = idUltimoProcesoEjecutado
  }
  setProceso(proceso?:Proceso){
    this.proceso = proceso
    this.chunk = proceso?.chunks[proceso.contadorProceso] ?? undefined
  }
  liberar(){
    this.proceso = undefined
    this.chunk = undefined
    this.idUltimoProcesoEjecutado = undefined
  }
  async ejecutar(proceso: Proceso): Promise<Proceso> {
    return await new Promise<Proceso>(resolve => {
      setTimeout(() => {
        proceso.pendingSize = (proceso.pendingSize - 10) < 0 ? 0 : proceso.pendingSize - 10
        proceso.setEstado(proceso.pendingSize)
        return resolve(proceso)
      },
        this.tiempoEnEjecucion)
    })
  }
}
