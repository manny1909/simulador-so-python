import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Proceso } from '../models/classes/proceso';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { RecursoService } from './recurso.service';
import { randomInt } from '../util/iutil';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  readonly _snackBar = inject(MatSnackBar)
  readonly _recursoService = inject(RecursoService)
  // procesosNuevos = signal<Proceso[]>(new Array())
  // procesosListos = signal<Proceso[]>(new Array())
  // procesosEjecutando = signal<Proceso[]>(new Array())
  // procesosBloqueados = signal<Proceso[]>(new Array())
  // procesosTerminados = signal<Proceso[]>(new Array())
  procesosNuevos = signal<Proceso[]>([
    new Proceso('Proceso A', 100, 'memory', 'nuevo', 1),
    new Proceso('Proceso B', 150, 'processor', 'nuevo', 2),
    new Proceso('Proceso C', 200, 'graphicsCard', 'nuevo', 3),
    new Proceso('Proceso D', 300, 'hardDrive', 'nuevo', 4)
  ]);

  procesosListos = signal<Proceso[]>([
    new Proceso('Proceso E', 120, 'memory', 'listo', 5),
    new Proceso('Proceso F', 180, 'processor', 'listo', 6),
    new Proceso('Proceso G', 250, 'graphicsCard', 'listo', 7)
  ]);

  procesosEjecutando = signal<Proceso[]>([
    new Proceso('Proceso H', 130, 'memory', 'ejecutando', 8),
    new Proceso('Proceso I', 170, 'processor', 'ejecutando', 9),
    new Proceso('Proceso J', 220, 'graphicsCard', 'ejecutando', 10)
  ]);

  procesosBloqueados = signal<Proceso[]>([
    new Proceso('Proceso K', 140, 'memory', 'bloqueado', 11),
    new Proceso('Proceso L', 160, 'processor', 'bloqueado', 12),
    new Proceso('Proceso M', 270, 'graphicsCard', 'bloqueado', 13)
  ]);

  procesosTerminados = signal<Proceso[]>([
    new Proceso('Proceso N', 110, 'memory', 'terminado', 14),
    new Proceso('Proceso O', 190, 'processor', 'terminado', 15),
    new Proceso('Proceso P', 230, 'graphicsCard', 'terminado', 16)
  ]);
  todosLosProcesos = computed(() => [
    ...this.procesosNuevos(),
    ...this.procesosListos(),
    ...this.procesosEjecutando(),
    ...this.procesosBloqueados(),
    ...this.procesosTerminados()
  ]);
  constructor() { }
  randomInt(): number {
    const idRandom = randomInt()
    const i = this.todosLosProcesos().findIndex(x => x.id == idRandom)
    return i == -1 ? this.randomInt() : idRandom
  }
  addProcesoToList(newProcess: Proceso, listaProceso: WritableSignal<Array<Proceso>>) {
    newProcess.id = !newProcess.id ? this.randomInt() : newProcess.id
    if (!newProcess.id) throw new Error('id en proceso fue undefined')
    listaProceso.update((value) => [...value, newProcess])
    Swal.fire({
      position: 'bottom',
      toast: true,
      title: 'Proceso creado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  }
  updateProcessToList(updatedProcess: Proceso, listaProceso: WritableSignal<Array<Proceso>>) {
    listaProceso.update((value) => {
      const i = value.findIndex(x => x.id == updatedProcess.id)
      if (i != -1) {
        value[i] = updatedProcess
      }
      Swal.fire({
        position: 'bottom',
        toast: true,
        title: 'Proceso creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
      return value
    })
  }
  actualizarProcesos() {
    console.log('entre a actualizarProcesos')
    //terminados
    this.actualizarTerminados()
    //ejecución
    this.actualizarEjecucion()
    //listos
    this.actualizarListos()
    //bloqueado y nuevo
    this.actualizarBloqueadoYNuevo()
  }
  actualizarTerminados() {
    this.procesosTerminados.update(value => {
      value.splice(0, 3)
      return [...value]
    })
  }
  actualizarEjecucion() {
    const procesosEjecutando = this.procesosEjecutando()
    let recursos = this._recursoService.recursos
    this._recursoService.recursos = recursos
    if (procesosEjecutando.length < 1) {
      return
    }
    const proceso = procesosEjecutando[0]
    const flag = proceso.ejecutar(10)
    if (flag && proceso.estado!='terminado') {
      const i = recursos.findIndex(x => !x.ocupado && x.recurso == proceso.processResource)
      if (i == -1) {
        proceso.setEstado('bloqueado')
        const indexRecurso = recursos.findIndex(x => x.recurso == proceso.processResource)
        recursos[indexRecurso].idProceso = undefined
        recursos[indexRecurso].ocupado = false
        this.procesosBloqueados.update(value => [...value, proceso])
        this.procesosEjecutando.update(value => this.eliminarDeArray(value, 0, 1))
      }
      else {
        proceso.setEstado('listo')
        recursos[i].idProceso = proceso.id
        recursos[i].ocupado = true
        this.procesosListos.update(value => [...value, proceso])
        this.procesosEjecutando.update(value => this.eliminarDeArray(value, 0, 1))
      }
    }
    else {
      this.procesosTerminados.update(value => [...value, proceso])
      this.procesosEjecutando.update(value => this.eliminarDeArray(value, 0, 1))
    }
  }
  eliminarDeArray(arr: Array<Proceso>, start: number, deleteCount?: number): Array<Proceso> {
    deleteCount ? arr.splice(start, deleteCount) : arr.splice(start)
    return [...arr]
  }
  actualizarListos() {
    const procesosListos = this.procesosListos()
    if (procesosListos.length < 1) {
      return
    }
    const proceso = procesosListos[0]
    proceso.setEstado('ejecutando')
    this.procesosEjecutando.update(value => [...value, proceso])
    this.procesosListos.update(value => this.eliminarDeArray(value, 0, 1))
  }
  actualizarBloqueadoYNuevo() {
    let procesosNuevos = this.procesosNuevos()
    let procesosBloqueados = this.procesosBloqueados()
    let recursos = this._recursoService.recursos
    while (this._recursoService.recursosDisponibles() && (procesosNuevos.length > 0 || procesosBloqueados.length > 0)) {
      let proceso: Proceso
      if (procesosBloqueados.length > 0) {
        proceso = procesosBloqueados[0]
        const indexRecurso = recursos.findIndex(x => !x.ocupado && x.recurso == proceso.processResource)
        if (indexRecurso != -1) {
          recursos[indexRecurso].idProceso = proceso.id
          recursos[indexRecurso].ocupado = true
          this._recursoService.recursos = recursos
          proceso.setEstado('listo')
          this.procesosListos.update(value => [...value, proceso])
          this.procesosBloqueados.update(value => this.eliminarDeArray(value, 0, 1))
        }
        procesosBloqueados.splice(0,1)
      }
      if (procesosNuevos.length > 0) {
        proceso = procesosNuevos[0]
        const indexRecurso = recursos.findIndex(x => !x.ocupado && x.recurso == proceso.processResource)
        if (indexRecurso != -1) {
          recursos[indexRecurso].idProceso = proceso.id
          recursos[indexRecurso].ocupado = true
          this._recursoService.recursos = recursos
          proceso.setEstado('listo')
          this.procesosListos.update(value => [...value, proceso])
          this.procesosNuevos.update(value => this.eliminarDeArray(value, 0, 1))
        }
        procesosNuevos.splice(0,1)
      }
    }
  }
}
