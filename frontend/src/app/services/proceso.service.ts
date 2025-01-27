import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
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
  procesosListos = signal<Proceso[]>(new Array())
  procesosEjecutando = signal<Proceso[]>(new Array())
  procesosBloqueados = signal<Proceso[]>(new Array())
  procesosTerminados = signal<Proceso[]>(new Array())

  procesosNuevos = signal<Proceso[]>([
    new Proceso('Proceso A', 100, ['memory', 'graphicsCard'], 'nuevo', 1),
    new Proceso('Proceso B', 150, ['processor', 'hardDrive'], 'nuevo', 2),
    new Proceso('Proceso C', 200, ['graphicsCard', 'processor', 'memory'], 'nuevo', 3),
    new Proceso('Proceso D', 300, ['processor', 'hardDrive'], 'nuevo', 4)
  ]);

  todosLosProcesos = computed(() => [
    ...this.procesosNuevos(),
    ...this.procesosListos(),
    ...this.procesosEjecutando(),
    ...this.procesosBloqueados(),
    ...this.procesosTerminados()
  ]);
  constructor() {
    const procesosNuevos = this.procesosNuevos()
    if (procesosNuevos.length) {
      procesosNuevos.forEach(proceso => this._memoriaService.cargarProcesoEnMemoria(proceso))
      const filteredMemory = this._memoriaService.memoria.flat().filter(x => x.processChunk == undefined);
      console.log(filteredMemory.length)
    }
  }
  getRandom(): number {
    const idRandom = randomInt()
    const i = this.todosLosProcesos().findIndex(x => x.id == idRandom)
    return i != -1 ? this.getRandom() : idRandom
  }
  addProcesoToList(newProcess: Proceso, listaProceso: WritableSignal<Array<Proceso>>) {
    newProcess.id = !newProcess.id ? this.getRandom() : newProcess.id
    if (!newProcess.id) throw new Error('id en proceso fue undefined')
    //filtro de campos disponibles
    const camposDisponibles = this._memoriaService.memoria.flat().filter(x => x.processChunk == undefined);
    const espacioDisponible = camposDisponibles.length * this._memoriaService.espacioMemoria
    if (espacioDisponible < newProcess.processSize) {
      Swal.fire({
        position: 'bottom',
        toast: true,
        title: 'No hay suficiente espacio para crear el proceso',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      })
      return;
    }

    this._memoriaService.cargarProcesoEnMemoria(newProcess)
    Swal.fire({
      position: 'bottom',
      toast: true,
      title: 'Proceso creado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
    if (!this.validarProminencia(newProcess)){
      listaProceso.update((value) => [...value, newProcess])
    }
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
    // console.log('entre a actualizarProcesos', this._recursoService.recursos)
    // //bloqueado y nuevo
    this.actualizarBloqueadoYNuevo()
    // //listos
    this.actualizarListos()
    //ejecución
    setTimeout(() => {
      this.actualizarEjecucion()
    }, 2000);
    //terminados
    this.actualizarTerminados()
  }
  actualizarTerminados() {
    if (this.procesosTerminados().length) {
      this.procesosTerminados.update(value => {
        this._memoriaService.liberarMemoria(value[0]?.id)
        value.splice(0, 1)
        return [...value]
      })
      const camposDisponibles = this._memoriaService.memoria.flat().filter(x => x.processChunk == undefined);
      const espacioDisponible = camposDisponibles.length * this._memoriaService.espacioMemoria
      console.log(espacioDisponible)
    }
  }

  actualizarEjecucion() {
    const procesosEjecutando = this.procesosEjecutando()
    const procesosListos = this.procesosListos()
    const procesosTerminados = this.procesosTerminados()
    let recursos = this._recursoService.recursos
    if (procesosEjecutando.length > 0) {
      const proceso = procesosEjecutando[0]
      if (proceso.prominencia =='si') {
        console.log('Se ejecuto el proceso con prominencia')
      }
      this._procesadorService.ejecutar(proceso)
      proceso.processResources?.forEach(recurso => {
        const liberaRecurso = proceso.estado == 'terminado' ? true : this.getRandomBoolean()
        Swal.fire({
          position: 'bottom',
          toast: true,
          title: 'libera el recurso: ' + liberaRecurso,
          icon: 'info',
          timer: 1000,
          showConfirmButton: false,
        })
        const indexRecurso = recursos.findIndex(item => item.recurso == recurso)
        if (indexRecurso != -1 && liberaRecurso) {
          recursos[indexRecurso].idProceso = undefined
          recursos[indexRecurso].ocupado = false
          this._recursoService.recursos = recursos
        }
      })

      if (proceso.estado == 'listo') {
        procesosListos.push(proceso)
      }
      else if (proceso.estado == 'terminado') {
        procesosTerminados.push(proceso)
        recursos.forEach(_recurso => {
          if (_recurso.idProceso == proceso.id) {
            _recurso.idProceso == null
            _recurso.ocupado == false
          }
        })
      }
      procesosEjecutando.splice(0, 1)
    }
    this.procesosTerminados.update(() => [...procesosTerminados])
    this.procesosListos.update(() => [...procesosListos])
    this.procesosEjecutando.update(() => [...procesosEjecutando])
    this._recursoService.recursos = recursos
  }
  eliminarDeArray(arr: Array<Proceso>, start: number, deleteCount?: number): Array<Proceso> {
    deleteCount ? arr.splice(start, deleteCount) : arr.splice(start)
    return [...arr]
  }
  actualizarListos() {
    const procesosListos = this.procesosListos()
    const procesosBloqueados = this.procesosBloqueados()
    const procesosEjecutando = this.procesosEjecutando()
    const recursos = this._recursoService.recursos
    if (procesosListos.length > 0) {
      procesosListos.forEach((_proceso, index, array) => {
        const tieneRecursos = _proceso.validarRecursos(recursos)
        if (!tieneRecursos) {
          _proceso.setEstado('bloqueado')
          procesosBloqueados.push(_proceso)
          procesosListos.splice(index, 1)
        }
      })
      if (procesosListos.length) {
        const _proceso = procesosListos[0]
        const tieneRecursos = _proceso.validarRecursos(recursos)
        if (!tieneRecursos) {
          _proceso.setEstado('bloqueado')
          procesosBloqueados.push(_proceso)
          procesosListos.splice(0, 1)
        }
        else {
          _proceso.setEstado('ejecutando')
          procesosEjecutando.push(_proceso)
          procesosListos.splice(0, 1)
          _proceso.processResources?.forEach(recurso => {
            const indexRecurso = recursos.findIndex(x => x.recurso == recurso)
            if (indexRecurso != -1) {
              recursos[indexRecurso].idProceso = _proceso.id
              recursos[indexRecurso].ocupado = true
              this._recursoService.recursos = recursos
            }
          })
        }

      }
    }
    this.procesosListos.update(() => [...procesosListos])
    this.procesosEjecutando.update(() => [...procesosEjecutando])
    this.procesosBloqueados.update(() => [...procesosBloqueados])
  }
  actualizarBloqueadoYNuevo() {
    const procesosNuevos = this.procesosNuevos();
    const procesosBloqueados = this.procesosBloqueados();
    const procesosListos = this.procesosListos();
    const procesoBloqueado = procesosBloqueados[0]
    const procesoNuevo = procesosNuevos[0]
    if (procesoBloqueado) {
      let flag: boolean = true
      procesoBloqueado.processResources?.forEach(x => {
        //si el recurso no esta ocupado o lo ocupa el proceso en cuestión
        flag = this._recursoService.recursos.findIndex(z => z.recurso == x && (z.ocupado == false || z.idProceso == procesoBloqueado.id)) != -1
      })
      if (flag) {
        procesoBloqueado.setEstado('listo')
        procesosBloqueados.splice(0, 1)
        procesosListos.push(procesoBloqueado)
      }
      else if (!this.procesosEjecutando().length && !procesosListos.length) {
        this._recursoService.recursos.forEach(item => {
          if (procesoBloqueado.processResources?.includes(item.recurso)) {
            item.idProceso = undefined
            item.ocupado = false
          }
        })
      }
    }
    if (procesoNuevo) {
      procesoNuevo.setEstado('listo')
      procesosNuevos.splice(0, 1)
      procesosListos.push(procesoNuevo)
    }
    this.procesosNuevos.update(() => [...procesosNuevos]);
    this.procesosBloqueados.update(() => [...procesosBloqueados]);
    this.procesosListos.update(() => [...procesosListos]);
  }
  validarProminencia(proceso: Proceso): boolean {
    if (proceso.prominencia === 'si') {
      const procesosEjecutando = this.procesosEjecutando();
      const procesosListos = this.procesosListos();
      const procesoEjecutando = procesosEjecutando[0];
      const recursos = this._recursoService.recursos

      if (procesoEjecutando) {
        procesoEjecutando.setEstado('listo');

        procesosListos.push(procesoEjecutando);
        procesosEjecutando.splice(0, 1);

        this.procesosListos.update(() => [...procesosListos]);

      }
      proceso.setEstado('ejecutando');
      procesosEjecutando.push(proceso);
      proceso.processResources?.forEach(recurso => {
        const indexRecurso = recursos.findIndex(x => x.recurso == recurso)
        if (indexRecurso != -1) {
          recursos[indexRecurso].idProceso = proceso.id
          recursos[indexRecurso].ocupado = true
        }
      })
      this.procesosEjecutando.update(() => [...procesosEjecutando]);
      this._recursoService.recursos = recursos
       return true
    } else if (proceso.prominencia === 'no') {
      proceso.setEstado('listo');
      this.procesosListos.update(listos => [proceso, ...listos]);
      return true
    }
    return false
  }
}
