import { Injectable, inject } from '@angular/core';
import { Hilo, Proceso, ProcessChunk, sizeChunk } from '../models/classes/proceso';
import { generatePastelColor, IMemoria } from '../models/interfaces/memoria';

@Injectable({
  providedIn: 'root'
})
export class MemoriaService {
  rowSize = 10
  columnSize = 10
  rowSizeSecundaria = this.rowSize * 2
  columnSizeSecundaria = this.columnSize * 2
  espacioMemoria = sizeChunk
  asignacionEnMemoriaPrincipal = 2 // Cantidad de chunks que se asignarán en la memoria principal
  memoria: Array<Array<IMemoria>> = []
  memoriaSecundaria: Array<Array<IMemoria>> = []
  procesosSistemaOperativo = [
    new Proceso('proceso SO 1', 100, ['memory', 'processor'], 'ejecutando', 997),
    new Proceso('proceso SO 2', 120, ['memory', 'processor'], 'ejecutando', 998),
    new Proceso('proceso SO 3', 130, ['memory', 'processor'], 'ejecutando', 999),
  ]
  constructor() {
    const processChunk = new ProcessChunk()
    this.memoria = Array.from({ length: this.rowSize }, (_, i) =>
      Array.from({ length: this.columnSize }, (_, j): IMemoria => ({ address: `row${i}-col${j}`, processChunk }))
    );
    this.memoriaSecundaria = Array.from({ length: this.rowSize * 2 }, (_, i) =>
      Array.from({ length: this.columnSize * 2 }, (_, j): IMemoria => ({ address: `row${i}-col${j}`, processChunk }))
    );
    this.distribuirChunksSO();
  }
  verificarMemoriaLlena(): boolean {
    return this.memoria.every(fila => fila.every(celda => celda.processChunk));
  }
  cargarProcesoEnMemoria(proceso: Proceso | Hilo) {
    try {
      const color = generatePastelColor()
      if (proceso.hasThreads) {
        proceso.hilos.forEach(hilo=> this.distribuirChunks(hilo, color))
      } else {
        this.distribuirChunks(proceso, color)
      }
    } catch (error) {
      this.liberarMemoria(proceso)
    }
  }

  private distribuirChunks(proceso: Proceso, color:string, isSO: boolean = false) {
    const posicionesDisponiblesMPrincipal = this.getPosicionesDisponibles(this.memoria, this.columnSize, this.rowSize)
    const posicionesDisponiblesMSecundaria = this.getPosicionesDisponibles(this.memoriaSecundaria, this.columnSizeSecundaria, this.rowSizeSecundaria)
    if (posicionesDisponiblesMPrincipal.length < 10) {
      throw new Error("No hay suficientes posiciones disponibles en la memoria principal para la asignación");
    }
    if (proceso.chunks.length > this.asignacionEnMemoriaPrincipal && proceso.chunks.length - 10 > posicionesDisponiblesMSecundaria.length) {
      throw new Error("No hay suficiente espacio en la memoria secundaria para almacenar todos los chunks")
    }
    if (isSO) {
      proceso.chunks.forEach(chunk => this.asignarEspacio(this.memoria, posicionesDisponiblesMPrincipal, chunk, color, false))
    }
    else {
      proceso.chunks.forEach((chunk, index) => {
        if (index < this.asignacionEnMemoriaPrincipal) {
          this.asignarEspacio(this.memoria, posicionesDisponiblesMPrincipal, chunk, color)
        }
        else {
          this.asignarEspacio(this.memoriaSecundaria, posicionesDisponiblesMSecundaria, chunk, color)
        }
      })
    }
  }
  async liberarMemoria(proceso: Proceso): Promise<void> {
    const esHilo = proceso instanceof Hilo
    const idProceso = proceso.id
    const idHilo = esHilo ? proceso.idHilo : null
    return new Promise((resolve, reject) => {
      try {
        if (idProceso !== undefined) {
          const defaultChunk = new ProcessChunk()
          this.memoria.forEach(row => {
            row.forEach(col => {
              if (col.processChunk?.idProceso == idProceso && (idHilo == null || col.processChunk.idHilo == idHilo)) {
                col.processChunk = defaultChunk;
                col.color = 'white'
              }
            })
          })
          this.memoriaSecundaria.forEach(row => {
            row.forEach(col => {
              if (col.processChunk?.idProceso == idProceso && (idHilo == null || col.processChunk.idHilo == idHilo)) {
                col.processChunk = defaultChunk;
                col.color = 'white'
              }
            })
          })
        }
        resolve()
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })
  }
  getPosicionesDisponibles(memoria: Array<Array<IMemoria>>, columnSize: number, rowSize: number): [number, number][] {
    const posiciones: [number, number][] = []

    for (let i = 0; i < columnSize; i++) {
      for (let j = 0; j < rowSize; j++) {
        // Solo agregar posiciones que no estén ocupadas
        const chunk = memoria[i][j].processChunk;
        if (!chunk.idProceso) {
          posiciones.push([i, j])
        }
      }
    }
    return posiciones
  }
  asignarEspacio(memoria: any[][], posicionesDisponibles: [number, number][], chunk: ProcessChunk, color: string, aleatorio: boolean = true) {
    if (posicionesDisponibles.length === 0) {
      console.error("No hay posiciones disponibles para asignar el chunk");
      return;
    }

    let indiceSeleccionado;
    if (aleatorio) {
      indiceSeleccionado = Math.floor(Math.random() * posicionesDisponibles.length);
    } else {
      indiceSeleccionado = 0; // Selecciona la primera posición disponible
    }

    const posicionSeleccionada = posicionesDisponibles[indiceSeleccionado];

    if (!posicionSeleccionada) {
      console.error("Posición seleccionada no válida");
      return;
    }

    const [col, row] = posicionSeleccionada;

    if (col >= memoria.length || row >= memoria[col].length) {
      console.error("Posición fuera de los límites de la memoria");
      return;
    }
    chunk.address = [col, row]
    memoria[col][row].processChunk = chunk;
    memoria[col][row].color = color;

    posicionesDisponibles.splice(indiceSeleccionado, 1);
  }
  distribuirChunksSO() {
    const procesosSO = this.procesosSistemaOperativo;
    procesosSO.forEach(proceso => {
      try {
        const color = '#FFD700'
        if (proceso.hasThreads && proceso.hilos) {
          proceso.hilos.forEach(hilo =>this.distribuirChunks(hilo, color, true))
        }
        else {
          this.distribuirChunks(proceso, color, true)
        }
      } catch (error) {
        this.liberarMemoria(proceso)
      }
    })
  }
  remplazarChunk(chunk: ProcessChunk) {
    // Marcar como ejecutado
    chunk.ejecutado = true;
    const memoria = this.memoria
    const memoriaSecundaria = this.memoriaSecundaria
    // Encontrar dirección del chunk en memoria secundaria
    const addressSecu = memoriaSecundaria.flat()
      .sort((a, b) => (a.processChunk?.chunkIndex ?? -1) - (b.processChunk?.chunkIndex ?? -1))
      .find(x => x.processChunk?.idProceso === chunk.idProceso && !x.processChunk?.ejecutado)
      ?.processChunk?.address;

    if (!chunk.address || !addressSecu) return;

    const [row, col] = chunk.address;
    const [rowSecu, colSecu] = addressSecu;

    const chunkPrincipal = memoria[row]?.[col];
    const chunkSecundario = memoriaSecundaria[rowSecu]?.[colSecu];

    if (!chunkPrincipal || !chunkSecundario) return;

    // Intercambio de direcciones y chunks
    const tempAddress = chunkSecundario.processChunk?.address;
    if (!tempAddress) return;

    chunkSecundario.processChunk.address = chunk.address;
    chunk.address = tempAddress;

    chunkPrincipal.processChunk = chunk
    // Intercambiar en memoria
    memoria[row][col] = chunkSecundario;
    memoriaSecundaria[rowSecu][colSecu] = chunkPrincipal;
    this.memoria = memoria
    this.memoriaSecundaria = memoriaSecundaria

  }
}
