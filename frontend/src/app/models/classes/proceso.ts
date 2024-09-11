import { ProcessResource, ProcessStatus } from "../interfaces/proceso"

export class Proceso {
  id: number | undefined
  processName: string | undefined
  processSize: number | 0
  processResource: ProcessResource | undefined
  estado: ProcessStatus
  pendingSize: number
  contadorProceso: number | undefined
  constructor(processName: string, processSize: number, processResource: ProcessResource, estado?: ProcessStatus, id?: number) {
    this.id = id
    this.processName = processName
    this.processSize = processSize
    this.processResource = processResource
    this.estado = estado ?? 'nuevo'
    this.pendingSize = processSize
  }

  setEstado(estado: ProcessStatus) {
    this.estado = estado
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
