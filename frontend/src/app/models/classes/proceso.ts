import { Prominencia } from './../interfaces/proceso';
import { ProcessResource, ProcessStatus } from "../interfaces/proceso"
import { IResource } from "../interfaces/resource"

export class Proceso {
  id: number | undefined
  processName: string | undefined
  processSize: number | 0
  processResources: ProcessResource[] | undefined
  prominencia: Prominencia
  estado: ProcessStatus
  pendingSize: number
  contadorProceso: number | undefined
  constructor(processName: string, processSize: number, processResource: ProcessResource[], estado?: ProcessStatus, id?: number, prominencia: Prominencia = undefined) {
    this.id = id
    this.processName = processName
    this.processSize = processSize
    this.processResources = processResource
    this.estado = estado ?? 'nuevo'
    this.pendingSize = processSize
    this.prominencia = prominencia
  }

  setEstado(estado: ProcessStatus) {
    this.estado = estado
  }
  validarRecursos(recursos: IResource[]): boolean {
    if (!this.processResources) return true;
    return this.processResources.every(_recurso => {
      const recurso = recursos.find(r => r.recurso === _recurso);
      return recurso && (!recurso.ocupado || recurso.idProceso === this.id);
    });
  }
  generarChunks(sizeChunk: number): ProcessChunk[] {
    if (sizeChunk <= 0) {
      throw new Error("El tamaño del chunk debe ser mayor a 0")
    }

    const chunks: ProcessChunk[] = []
    const totalChunks = Math.ceil(this.pendingSize / sizeChunk)
    let idChunk = this.contadorProceso ?? 0
    for (let i = 0; i < totalChunks; i++) {
      const chunkSize = (i + 1) * sizeChunk > this.pendingSize
        ? this.pendingSize - i * sizeChunk
        : sizeChunk

      const chunk = new ProcessChunk(this.id || 0, chunkSize, idChunk)
      chunks.push(chunk)
      idChunk++
    }

    return chunks
  }
  reconstruirProceso(chunks: ProcessChunk[]): void {
    const processSize = chunks.reduce((total, chunk) => total + chunk.chunkSize, 0)
    this.id = chunks[0].idProceso
    this.processSize = processSize
    this.pendingSize = 0
  }
}

export class ProcessChunk {
  idProceso: number
  chunkSize: number
  chunkIndex: number

  constructor(idProceso: number, chunkSize: number, chunkIndex: number) {
    this.idProceso = idProceso
    this.chunkSize = chunkSize
    this.chunkIndex = chunkIndex
  }
}
