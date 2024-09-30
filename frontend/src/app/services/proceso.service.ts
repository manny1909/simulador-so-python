import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Proceso } from '../models/classes/proceso';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { RecursoService } from './recurso.service';
import { randomInt } from '../util/iutil';
import { MemoriaService } from './memoria.service';
import { ProcesadorService } from './procesador.service';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  readonly _snackBar = inject(MatSnackBar)
  readonly _recursoService = inject(RecursoService)
  readonly _memoriaService = inject(MemoriaService)
  readonly _procesadorService = inject(ProcesadorService)
  // procesosNuevos = signal<Proceso[]>(new Array())
  // procesosListos = signal<Proceso[]>(new Array())
  // procesosEjecutando = signal<Proceso[]>(new Array())
  // procesosBloqueados = signal<Proceso[]>(new Array())
  // procesosTerminados = signal<Proceso[]>(new Array())
  procesosNuevos = signal<Proceso[]>([
    new Proceso('Proceso A', 100, 'memory', 'nuevo', 1),
    new Proceso('Proceso B', 150, 'processor', 'nuevo', 2),
    new Proceso('Proceso C', 200, 'graphicsCard', 'nuevo', 3),
    new Proceso('Proceso D', 300, 'processor', 'nuevo', 4)
  ]);

  procesosListos = signal<Proceso[]>([
    // new Proceso('Proceso E', 120, 'memory', 'listo', 5),
    // new Proceso('Proceso F', 180, 'processor', 'listo', 6),
    // new Proceso('Proceso G', 250, 'graphicsCard', 'listo', 7)
  ]);

  procesosEjecutando = signal<Proceso[]>([
    // new Proceso('Proceso H', 130, 'memory', 'ejecutando', 8),
    // new Proceso('Proceso I', 170, 'processor', 'ejecutando', 9),
    // new Proceso('Proceso J', 220, 'graphicsCard', 'ejecutando', 10)
  ]);

  procesosBloqueados = signal<Proceso[]>([
    // new Proceso('Proceso K', 140, 'memory', 'bloqueado', 11),
    // new Proceso('Proceso L', 160, 'processor', 'bloqueado', 12),
    // new Proceso('Proceso M', 270, 'graphicsCard', 'bloqueado', 13)
  ]);

  procesosTerminados = signal<Proceso[]>([
    // new Proceso('Proceso N', 110, 'memory', 'terminado', 14),
    // new Proceso('Proceso O', 190, 'processor', 'terminado', 15),
    // new Proceso('Proceso P', 230, 'graphicsCard', 'terminado', 16)
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
  getRandomBoolean(): boolean {
    return Math.random() >= 0.5;
  }
  actualizarProcesos() {
    console.log('entre a actualizarProcesos')
    const procesosNuevos = this.procesosNuevos
    const procesosListos = this.procesosListos
    const procesosEjecutando = this.procesosEjecutando
    const procesosBloqueados = this.procesosBloqueados
    const procesosTerminados = this.procesosTerminados
    const recursos = this._recursoService.recursos
    //terminados
    this.actualizarTerminados()
    this.actualizarRecursos()
    //ejecución
    this.actualizarEjecucion()
    // //listos
    this.actualizarListos()
    // //bloqueado y nuevo
    this.actualizarBloqueadoYNuevo()
  }
  actualizarTerminados() {
    this.procesosTerminados.update(value => {
      value.splice(0, 3)
      return [...value]
    })
  }
  actualizarRecursos() {
    const procesosEjecutando = this.procesosEjecutando()
    const procesosListos = this.procesosListos()
    const procesosBloqueados = this.procesosBloqueados()
    const recursos = this._recursoService.recursos

    recursos.forEach((recurso, index) => {
      const indexProceso = procesosEjecutando.findIndex(x => x.processResource == recurso.recurso)
      if (indexProceso == -1) {
        recurso.ocupado = false
        recurso.idProceso = undefined
      }
      else {
        recurso.idProceso = procesosEjecutando[indexProceso].id
        recurso.ocupado = true
      }
    })

    const idProcesos = recursos.map(x => x.idProceso)
    procesosEjecutando.forEach((proceso, index) => {
      if (!idProcesos.includes(proceso.id)) {
        if (!this._memoriaService.verificarMemoriaLlena()) {
          proceso.setEstado('listo')
          //función asignar espacio en memoria
          procesosEjecutando.splice(index, 0)
          procesosListos.push(proceso)
        }
        else {
          proceso.setEstado('bloqueado')
          //función asignar espacio en memoria
          procesosEjecutando.splice(index, 0)
          procesosBloqueados.push(proceso)
        }
      }
    })
    this.procesosBloqueados.update(x => [...procesosBloqueados])
    this.procesosListos.update(x => [...procesosListos])
    this.procesosEjecutando.update(x => [...procesosEjecutando])
    this._recursoService.recursos = recursos
  }
  actualizarEjecucion() {
    const procesosEjecutando = this.procesosEjecutando()
    const procesosListos = this.procesosListos()
    const procesosBloqueados = this.procesosBloqueados()
    const procesosTerminados = this.procesosTerminados()
    let recursos = this._recursoService.recursos
    if (procesosEjecutando.length > 0) {
      const proceso = procesosEjecutando[0]
      console.log('Ejecutando proceso', proceso.processName, '...')
      this._procesadorService.ejecutar(proceso)
      recursos.forEach(item => {
        if (item.recurso == proceso.processResource){
          
          if (item.ocupado && item.idProceso!==undefined) {
            item.idProceso = proceso.id
            item.ocupado = true
          }
          if (item.ocupado && item.idProceso!= proceso.id) {
            proceso.setEstado('bloqueado')
            procesosEjecutando.splice(0, 1)
            procesosBloqueados.push(proceso)
          }
          else{
            item.ocupado = true
          }
        }
      })
      if (proceso.estado != 'terminado') {
        proceso.setEstado('listo')
        recursos.forEach(item => {
          const liberaRecurso = this.getRandomBoolean()
          console.log('libera el recurso:',liberaRecurso)
          const flag = proceso.processResource == item.recurso
          if (flag && liberaRecurso) {
            item.idProceso = undefined
            item.ocupado = false
          }
        })
        procesosListos.push(proceso)
        procesosEjecutando.splice(0, 1)
      }
      else {
        procesosTerminados.push(proceso)
        procesosEjecutando.splice(0, 1)
      }
    }
    // procesosEjecutando.forEach((proceso, index) => {
    //   this._procesadorService.ejecutar(proceso)
    //   if (proceso.estado != 'terminado') {
    //     console.log(this._memoriaService.verificarMemoriaLlena())
    //     if (!this._memoriaService.verificarMemoriaLlena()) {
    //       try {
    //         this._memoriaService.cargarProcesoEnMemoria(proceso)
    //         proceso.setEstado('listo')
    //         procesosListos.push(proceso)
    //         procesosEjecutando.splice(0, 1)
    //       } catch (error) {
    //         console.info('No se pudo cargar el proceso en memoria')
    //         procesosEjecutando.splice(0, 1)
    //         procesosBloqueados.push(proceso)
    //       }
    //     }
    //     else {
    //       proceso.setEstado('bloqueado')
    //       procesosEjecutando.splice(index, 0)
    //       procesosBloqueados.push(proceso)
    //     }
    //     const indexRecurso = recursos.findIndex(x => x.recurso == proceso.processResource)
    //     if (indexRecurso != -1) {
    //       recursos[indexRecurso] = { ...recursos[indexRecurso], idProceso: undefined, ocupado: false }
    //     }
    //   }
    //   else {
    //     procesosTerminados.push(proceso)
    //     procesosEjecutando.splice(index, 1)
    //   }
    // })
    this.procesosTerminados.update(x => [...procesosTerminados])
    this.procesosBloqueados.update(x => [...procesosBloqueados])
    this.procesosListos.update(x => [...procesosListos])
    this.procesosEjecutando.update(x => [...procesosEjecutando])
    this._recursoService.recursos = recursos
  }
  eliminarDeArray(arr: Array<Proceso>, start: number, deleteCount?: number): Array<Proceso> {
    deleteCount ? arr.splice(start, deleteCount) : arr.splice(start)
    return [...arr]
  }
  actualizarListos() {
    const procesosListos = this.procesosListos()
    const procesosEjecutando = this.procesosEjecutando()
    if (procesosListos.length>0) {
      const proceso = procesosListos[0]
      proceso.setEstado('ejecutando')
      procesosEjecutando.push(proceso)
      procesosListos.splice(0, 1)
    }
    // const recursos = this._recursoService.recursos.filter(x => !x.ocupado)
    // recursos.forEach(recurso => {
    //   const indexProceso = procesosListos.findIndex(x => x.processResource == recurso.recurso)
    //   if (indexProceso != -1) {
    //     const proceso = procesosListos[indexProceso]
    //     proceso.setEstado('ejecutando')
    //     recurso.ocupado = true
    //     recurso.idProceso = proceso.id
    //     procesosEjecutando.push(proceso)
    //     procesosListos.splice(indexProceso, 1)
    //   }
    // })
    this.procesosListos.update(value => [...procesosListos])
    this.procesosEjecutando.update(value => [...procesosEjecutando])
  }
  actualizarBloqueadoYNuevo() {
    const procesosNuevos = this.procesosNuevos();
    const procesosBloqueados = this.procesosBloqueados();
    const procesosListos = this.procesosListos();
    const flag = this.getRandomBoolean()
    if (flag) {
      const proceso = procesosBloqueados[0]
      if (proceso) {
        proceso.setEstado('listo')
        procesosBloqueados.splice(0,1)
        procesosListos.push(proceso)
      }
    }
    else {
      const proceso = procesosNuevos[0]
      if (proceso) {
        proceso.setEstado('listo')
        procesosNuevos.splice(0,1)
        procesosListos.push(proceso)
      }
      
    }
    // const rand = Math.random().valueOf()
    // let cont = 0
    // const updateList = (lista: Array<Proceso>) => {
    //   if (lista.length < 0) return;
    //   const proceso = lista[0]
    //   try {
    //     this._memoriaService.cargarProcesoEnMemoria(proceso)
    //     proceso.setEstado('listo')
    //     //función de asignar espacio en memoria
    //     procesosListos.push(proceso)
    //     lista.splice(0, 1)
    //   } catch (error) {
    //     console.info('No se pudo cargar el proceso en memoria')
    //     lista.splice(0, 1)
    //     lista.push(proceso)
    //   }
    // }
    // while (!this._memoriaService.verificarMemoriaLlena() || cont > 1000) {
    //   if (rand == 1) {
    //     updateList(procesosBloqueados)
    //   }
    //   else if (rand == 0) {
    //     updateList(procesosNuevos)
    //   }
    //   else {
    //     console.error('random no es ni 1 ni 0')
    //   }
    //   cont++
    // }

    // Actualizamos los signals
    this.procesosNuevos.update(value => [...procesosNuevos]);
    this.procesosBloqueados.update(value => [...procesosBloqueados]);
    this.procesosListos.update(value => [...procesosListos]);
  }

}
