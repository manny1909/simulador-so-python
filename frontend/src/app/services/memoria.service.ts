import { computed, inject, Injectable, Signal } from '@angular/core';
import { ProcesoService } from './proceso.service';
import { Proceso, ProcessChunk } from '../models/classes/proceso';
import { IMemoria } from '../models/interfaces/memoria';

@Injectable({
  providedIn: 'root'
})
export class MemoriaService {
  columnSize = 100
  rowSize = 100
  espacioMemoria = 10
  memoria:Array<Array<IMemoria>> =
  new Array(this.columnSize).fill(new Array(this.rowSize).fill({}))
  constructor() {
    for (let i = 0; i < this.columnSize; i++) {
      for (let j = 0; j < 5; j++) {
        this.memoria[i][j] = {
          address: `col${i}-row${j}`,
          processChunk: undefined
        }
      }
    }
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

    chunks.forEach(chunk => {
      const indiceAleatorio = Math.floor(Math.random() * posicionesDisponibles.length)
      const posicionSeleccionada = posicionesDisponibles[indiceAleatorio]

      // Colocar el chunk en la posición seleccionada
      const [col, row] = posicionSeleccionada
      this.memoria[col][row].processChunk = chunk

      posicionesDisponibles.splice(indiceAleatorio, 1)
    })
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
