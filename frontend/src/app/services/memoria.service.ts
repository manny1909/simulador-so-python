import { Injectable } from '@angular/core';
import { Proceso, ProcessChunk } from '../models/classes/proceso';
import { generatePastelColor, IMemoria } from '../models/interfaces/memoria';

@Injectable({
  providedIn: 'root'
})
export class MemoriaService {
  rowSize = 10
  columnSize = 10
  espacioMemoria = 10
  memoria: Array<Array<IMemoria>> = []
  constructor() {
    const defaultProcessChunk: ProcessChunk = {
      idProceso: 0,
      chunkIndex: 100,
      chunkSize: 200,
    }
    this.memoria = Array.from({ length: this.rowSize }, (_, i) =>
      Array.from({ length: this.columnSize }, (_, j): IMemoria => ({ address: `row${i}-col${j}`, processChunk: undefined }))
    );
  }
  verificarMemoriaLlena(): boolean {
    //retorna true si la memoria está llena
    console.log(this.memoria)
    return this.memoria.every(fila => fila.every(celda => celda.processChunk));
  }
  cargarProcesoEnMemoria(proceso: Proceso) {
    const chunks: ProcessChunk[] = proceso.generarChunks(this.espacioMemoria)
    console.log(chunks.length)
    this.distribuirChunksAleatoriamente(chunks)
  }

  distribuirChunksAleatoriamente(chunks: ProcessChunk[]) {
    const totalCells = this.columnSize * this.rowSize

    if (chunks.length > totalCells) {
      throw new Error("No hay suficiente espacio en la memoria para almacenar todos los chunks")
    }

    const posicionesDisponibles = this.getPosicionesDisponibles()
    const color = generatePastelColor()
    chunks.forEach(chunk => {
      const indiceAleatorio = Math.floor(Math.random() * posicionesDisponibles.length)
      const posicionSeleccionada = posicionesDisponibles[indiceAleatorio]

      // Colocar el chunk en la posición seleccionada
      const [col, row] = posicionSeleccionada
      this.memoria[col][row].processChunk = chunk
      this.memoria[col][row].color = color

      posicionesDisponibles.splice(indiceAleatorio, 1)
    })
  }
  liberarMemoria(idProceso: number | undefined): void {
    if (idProceso !== undefined) {
      this.memoria.forEach(row => {
        row.forEach(col => {
          if (col.processChunk?.idProceso == idProceso) {
            col.processChunk = undefined
            col.color = undefined
          }
        })
      })
    }
  }

  getPosicionesDisponibles(): [number, number][] {
    const posiciones: [number, number][] = []

    for (let i = 0; i < this.columnSize; i++) {
      for (let j = 0; j < this.rowSize; j++) {
        // Solo agregar posiciones que no estén ocupadas
        if (!this.memoria[i][j].processChunk) {
          posiciones.push([i, j])
        }
      }
    }
    return posiciones
  }
}
