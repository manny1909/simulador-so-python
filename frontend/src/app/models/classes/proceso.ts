import { ProcessResource, ProcessStatus } from "../interfaces/proceso"

export class Proceso {
  id: number | undefined
  processName: string | undefined
  processSize: number | 0
  processResource: ProcessResource | undefined
  estado: ProcessStatus
  contadorPrograma: number
  constructor(processName: string, processSize: number, processResource: ProcessResource, estado?: ProcessStatus, id?: number) {
    this.id = id
    this.processName = processName
    this.processSize = processSize
    this.processResource = processResource
    this.estado = estado ?? 'nuevo'
    this.contadorPrograma = 0
  }

  setEstado(estado: ProcessStatus) {
    this.estado = estado
  }
  ejecutar(processedSize: number) {
    this.contadorPrograma = processedSize + this.contadorPrograma > this.processSize ? this.processSize : processedSize + this.contadorPrograma
    if (this.contadorPrograma == this.processSize) {
      this.estado = 'terminado'
      return false
    }
    return true
    // setTimeout(() => {
    //   console.log('Proceso', this.processName, 'tuvo pasó por el procesador')
    //   this.contadorPrograma == 100 && console.info('Proceso', this.processName, 'se ejecuto correctamente')
    // }, processedSize);
  }
}
