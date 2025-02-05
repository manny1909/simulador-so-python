import { Preeminencia } from './../interfaces/proceso';
import { ProcessResource, ProcessStatus } from "../interfaces/proceso"
import { IResource } from "../interfaces/resource"
import { IMemoria } from '../interfaces/memoria';
export const sizeChunk = 10;
export const sizeHilo = 50;
export class Proceso {
  id: number | undefined
  processName: string | undefined
  processSize: number | 0
  processResources: ProcessResource[] | undefined
  preeminencia: Preeminencia
  estado: ProcessStatus
  pendingSize: number
  contadorProceso: number
  registroInstrucciones: number | undefined
  hilos: Hilo[] = []
  threadSize: number = 50
  chunks: ProcessChunk[] = []
  hasThreads: boolean = false
  constructor(processName: string, processSize: number, processResource: ProcessResource[], estado?: ProcessStatus, id?: number, preeminencia: Preeminencia = undefined) {
    this.id = id
    this.processName = processName
    this.processSize = processSize
    this.processResources = processResource
    this.estado = estado ?? 'nuevo'
    this.pendingSize = processSize
    this.preeminencia = preeminencia
    this.contadorProceso = 0
    this.registroInstrucciones = undefined
    this.hasThreads = processSize>50
    if (this.hasThreads) {
      this.dividirEnHilos(sizeHilo)
    }
    else {
      this.chunks = this.generarChunks()
    }
  }

  setEstado(estado: ProcessStatus | number) {
    if (typeof estado == 'number') {
      this.estado = estado < 1 ? 'terminado' : 'listo'
    }
    else {
      this.estado = estado
    }
  }
  validarRecursos(recursos: IResource[]): boolean {
    if (!this.processResources) return true;
    return this.processResources.every(_recurso => {
      const recurso = recursos.find(r => r.recurso === _recurso);
      return recurso && (!recurso.ocupado || recurso.idProceso === this.id)
      && recurso.idHilo != this.id;
    });
  }
  generarChunks(): ProcessChunk[] {
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
    this.contadorProceso = chunks[0].chunkIndex || 0

    return chunks
  }
  reconstruirProceso(chunks: ProcessChunk[]): void {
    const processSize = chunks.reduce((total, chunk) => total + (chunk.chunkSize || 0), 0)
    this.id = chunks[0].idProceso
    this.processSize = processSize
    this.pendingSize = 0
  }
  dividirEnHilos(sizeHilo: number): void {
    if (sizeHilo <= 0) {
      throw new Error("El tamaño del hilo debe ser mayor a 0");
    }

    // Determina la cantidad total de hilos. Si el tamaño del proceso es menor a 150, calcula el número de hilos; de lo contrario, usa 3 hilos.
    let totalHilos = this.processSize < 150 ? Math.ceil(this.processSize / sizeHilo) : 3;
    this.hilos = [];

    // Tamaño base de cada hilo, ajustado para que sea múltiplo de 10
    const baseSize = Math.ceil((this.processSize / totalHilos) / 10) * 10;
    // Tamaño restante que no se puede dividir equitativamente en hilos
    const extra = this.processSize - (baseSize * totalHilos);

    // Crea cada hilo basado en el tamaño calculado
    for (let i = 0; i < totalHilos; i++) {
      let hiloSize = baseSize;

      // Si es el último hilo, agrega el tamaño restante
      if (i === totalHilos - 1) {
        hiloSize += extra;
      } else if (extra > 10) {
        // Ajuste para hacer múltiplo de 10
        hiloSize += 10;
      }
      const idHilo = i;
      const hilo = new Hilo(
        idHilo,
        `${this.processName} Hilo ${i}`,
        hiloSize,
        this.processResources || [],
        this.estado,
        this.id,
        this.preeminencia
      );
      this.hilos.push(hilo);
    }
  }
}
export class Hilo extends Proceso {
  idHilo: number
  constructor(idHilo: number, processName: string, processSize: number, processResource: ProcessResource[],
    estado?: ProcessStatus, id?: number, preeminencia: Preeminencia = undefined,) {
    super(processName, processSize, processResource, estado, id, preeminencia);
    this.idHilo = idHilo
    this.chunks = this.generarChunks()
  }
  override generarChunks(): ProcessChunk[] {
    const chunks = super.generarChunks();
    chunks.forEach(chunk => {
      chunk.idHilo = this.idHilo;
    });
    return chunks;
  }
}
export class ProcessChunk {
  idProceso: number | undefined
  chunkSize: number | undefined
  chunkIndex: number | undefined
  ejecutado?: boolean = false
  address?: [number, number]
  idHilo?: number = undefined
  constructor(idProceso?: number, chunkSize?: number, chunkIndex?: number) {
    this.idProceso = idProceso
    this.chunkSize = chunkSize
    this.chunkIndex = chunkIndex
  }
  remplazarChunk(memoria: IMemoria[][], memoriaSecundaria: IMemoria[][]) {
    // Marcar como ejecutado
    this.ejecutado = true;
    // Encontrar dirección del chunk en memoria secundaria
    const addressSecu = memoriaSecundaria.flat()
      .sort((a, b) => (a.processChunk?.chunkIndex ?? -1) - (b.processChunk?.chunkIndex ?? -1))
      .find(x => x.processChunk?.idProceso === this.idProceso && !x.processChunk?.ejecutado)
      ?.processChunk?.address;

    if (!this.address || !addressSecu) return;

    const [row, col] = this.address;
    const [rowSecu, colSecu] = addressSecu;

    const chunkPrincipal = memoria[row]?.[col];
    const chunkSecundario = memoriaSecundaria[rowSecu]?.[colSecu];

    if (!chunkPrincipal || !chunkSecundario) return;

    // Intercambio de direcciones y chunks
    const tempAddress = chunkSecundario.processChunk?.address;
    if (!tempAddress) return;

    chunkSecundario.processChunk.address = this.address;
    this.address = tempAddress;

    chunkPrincipal.processChunk = this;

    // Intercambiar en memoria
    memoria[row][col] = chunkSecundario;
    memoriaSecundaria[rowSecu][colSecu] = chunkPrincipal;

  }

}
