import { ProcesoService } from './proceso.service';
import { Injectable, inject } from '@angular/core';
import { Proceso, ProcessChunk } from '../models/classes/proceso';
import { generatePastelColor, IMemoria } from '../models/interfaces/memoria';

@Injectable({
  providedIn: 'root'
})
export class MemoriaService {
  rowSize = 10
  columnSize = 10
  rowSizeSecundaria = this.rowSize * 2
  columnSizeSecundaria = this.columnSize * 2
  espacioMemoria = 10
  AsignacionEnMemoriaPrincipal = 10 // Cantidad de chunks que se asignarán en la memoria principal
  memoria: Array<Array<IMemoria>> = []
  memoriaSecundaria: Array<Array<IMemoria>> = []
  procesosSistemaOperativo = [
    new Proceso('proceso SO 1', 100, ['memory', 'processor'], 'ejecutando',997),
    new Proceso('proceso SO 2', 120, ['memory', 'processor'], 'ejecutando',998),
    new Proceso('proceso SO 3', 130, ['memory', 'processor'], 'ejecutando',999),
  ]
  constructor() {
    const defaultProcessChunk: ProcessChunk = {
      idProceso: 0,
      chunkIndex: 100,
      chunkSize: 200,
    }
    this.memoria = Array.from({ length: this.rowSize }, (_, i) =>
      Array.from({ length: this.columnSize }, (_, j): IMemoria => ({ address: `row${i}-col${j}`, processChunk: undefined }))
    );
    this.memoriaSecundaria = Array.from({ length: this.rowSize * 2 }, (_, i) =>
      Array.from({ length: this.columnSize * 2 }, (_, j): IMemoria => ({ address: `row${i}-col${j}`, processChunk: undefined }))
    );
    this.distribuirChunksSO();
  }
  verificarMemoriaLlena(): boolean {
    return this.memoria.every(fila => fila.every(celda => celda.processChunk));
  }
  cargarProcesoEnMemoria(proceso: Proceso) {
    const chunks: ProcessChunk[] = proceso.generarChunks(this.espacioMemoria)
    this.distribuirChunksAleatoriamente(chunks)
  }

  distribuirChunksAleatoriamente(chunks: ProcessChunk[], isSO: boolean = false) {
    const posicionesDisponiblesMPrincipal = this.getPosicionesDisponibles(this.memoria, this.columnSize, this.rowSize)
    const posicionesDisponiblesMSecundaria = this.getPosicionesDisponibles(this.memoriaSecundaria, this.columnSizeSecundaria, this.rowSizeSecundaria)
    if (posicionesDisponiblesMPrincipal.length < 10) {
      throw new Error("No hay suficientes posiciones disponibles en la memoria principal para la asignación");
    }

    if (chunks.length > this.AsignacionEnMemoriaPrincipal && chunks.length - 10 > posicionesDisponiblesMSecundaria.length) {
      throw new Error("No hay suficiente espacio en la memoria secundaria para almacenar todos los chunks")
    }
    let color: string = isSO ? '#FFD700' : generatePastelColor()
    const asignacionEnMemoria = isSO ? 5 : this.AsignacionEnMemoriaPrincipal
    chunks.forEach((chunk, index) => {
      if (index < asignacionEnMemoria) {
        this.asignarEspacio(this.memoria, posicionesDisponiblesMPrincipal, chunk, color)
      }
      else {
        this.asignarEspacio(this.memoriaSecundaria, posicionesDisponiblesMSecundaria, chunk, color)
      }
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
      this.memoriaSecundaria.forEach(row => {
        row.forEach(col => {
          if (col.processChunk?.idProceso == idProceso) {
            col.processChunk = undefined
            col.color = undefined
          }
        })
      })
    }
  }
  getPosicionesDisponibles(memoria: Array<Array<IMemoria>>, columnSize: number, rowSize: number): [number, number][] {
    const posiciones: [number, number][] = []

    for (let i = 0; i < columnSize; i++) {
      for (let j = 0; j < rowSize; j++) {
        // Solo agregar posiciones que no estén ocupadas
        if (!memoria[i][j].processChunk) {
          posiciones.push([i, j])
        }
      }
    }
    return posiciones
  }
  asignarEspacio(memoria: Array<Array<IMemoria>>, posicionesDisponibles: [number, number][], chunk: ProcessChunk, color: string): void {
    const indiceAleatorio = Math.floor(Math.random() * posicionesDisponibles.length)
    const posicionSeleccionada = posicionesDisponibles[indiceAleatorio]

    // Colocar el chunk en la posición seleccionada
    const [col, row] = posicionSeleccionada
    memoria[col][row].processChunk = chunk
    memoria[col][row].color = color

    posicionesDisponibles.splice(indiceAleatorio, 1)
  }
  distribuirChunksSO() {
    const procesosSO = this.procesosSistemaOperativo;
    const color = '#FFD700'
    procesosSO.forEach(proceso => {
      const chunks = proceso.generarChunks(this.espacioMemoria)
      this.distribuirChunksAleatoriamente(chunks, true);
    })
  }
}
