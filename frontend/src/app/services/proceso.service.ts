import { computed, inject, Injectable, OnInit, signal } from '@angular/core';
import { Hilo, Proceso } from '../models/classes/proceso';
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
  idUltimoProcesoEjecutado: number | undefined
  procesosNuevos = signal<Proceso[]>(new Array());

  todosLosProcesos = computed(() => [
    ...this.procesosNuevos(),
    ...this.procesosListos(),
    ...this.procesosEjecutando(),
    ...this.procesosBloqueados(),
    ...this.procesosTerminados()
  ]);
  constructor() {

  }
  test() {
    const procesosPrueba = [
      new Proceso('Proceso A', 100, ['memory', 'graphicsCard'], 'nuevo', 1, undefined),
      new Proceso('Proceso B', 150, ['processor', 'hardDrive'], 'nuevo', 2, undefined),
      new Proceso('Proceso C', 100, ['graphicsCard', 'memory'], 'nuevo', 3, undefined),
      new Proceso('Proceso D', 300, ['processor', 'hardDrive'], 'nuevo', 4, undefined)
    ]
    procesosPrueba.forEach(proceso => {
      this.agregarProcesoANuevos(proceso)
    })
  }
  resetProcess(){
    this.procesosNuevos.update(value => [])
    this.procesosListos.update(value => [])
    this.procesosBloqueados.update(value => [])
    this.procesosEjecutando.update(value => [])
    this.procesosTerminados.update(value => [])
  }
  async actualizarProcesos() {
    //terminados
    this.actualizarTerminados()
    //bloqueados
    this.actualizarBloqueados()
    //nuevos
    this.actualizarNuevos()
    // //listos
    this.actualizarListos()
    // debugger
    //ejecución
    await this.actualizarEjecucion()
    // debugger
  }

  agregarProcesoANuevos(newProcess: Proceso, mostrar: boolean = false) {
    if (!newProcess.id) throw new Error('id en proceso fue undefined')
    //filtro de campos disponibles
    const camposDisponibles = this._memoriaService.memoria.flat().filter(x => x.processChunk.idProceso == undefined);
    const espacioDisponible = camposDisponibles.length * this._memoriaService.espacioMemoria
    if (espacioDisponible < newProcess.processSize) {
      Swal.fire({
        position: 'bottom',
        toast: true,
        title: 'No hay suficiente espacio para crear el proceso '+newProcess.processName,
        icon: 'error',
        timer: 3000,
        showConfirmButton: false,
      })
      return;
    }

    this._memoriaService.cargarProcesoEnMemoria(newProcess)
    this.subirProcesoANuevos(newProcess)
    mostrar && Swal.fire({
      position: 'bottom',
      toast: true,
      title: 'Proceso creado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  }
  subirProcesoANuevos(proceso: Proceso) {
    if (proceso.hasThreads && proceso.hilos) {
      this.procesosNuevos.update(value => [...value, ...proceso.hilos])
    }
    else {
      this.procesosNuevos.update(value => [...value, proceso])
    }
  }
  getRandomBoolean(): boolean {
    return Math.random() >= 0.5;
  }
  async actualizarTerminados() {
    if (this.procesosTerminados().length) {
      const proceso = this.procesosTerminados()[0]
      await this._memoriaService.liberarMemoria(proceso)
      this.procesosTerminados.update(value => {
        value.splice(0, 1)
        return [...value]
      })
    }
  }

  async actualizarEjecucion() {
    let recursos = this._recursoService.recursos
    for (const procesador of this._procesadorService.procesadores) {
      if (procesador.proceso) {
        let proceso = procesador.proceso
        const puedeEjecutarse = proceso.validarRecursos(recursos)
        if (puedeEjecutarse || (!puedeEjecutarse && !this.procesosListos().length)) {
          for (const recurso of recursos) {
            if (proceso.processResources?.includes(recurso.recurso)) {
              recurso.ocupado = true
              recurso.idProceso = proceso.id
            }
          }
          this._recursoService.recursos = recursos
          if (proceso.preeminencia == 'si') {
            console.log('Se ejecuto el proceso con preeminencia')
          }
          proceso = await this._procesadorService.ejecutar(proceso) ?? proceso
          this._procesadorService.liberar(proceso)
          if (proceso.processResources && proceso.estado == 'listo') {
            for (const recurso of proceso.processResources) {
              const index = recursos.findIndex(x => x.recurso == recurso)
              const liberaRecurso = this.getRandomBoolean()
              if (index != -1) {
                await Swal.fire({
                  position: 'bottom',
                  toast: true,
                  title: `Libera recurso ${recurso}: ${liberaRecurso ? 'Sí' : 'No'}`,
                  icon: 'info',
                  timer: 1000 / proceso.processResources.length,
                  showConfirmButton: false,
                })
                let id = proceso.id
                // if (proceso instanceof Hilo) {
                //   id = proceso.idHilo
                // }
                // else {
                //   id = proceso.id
                // }
                recursos[index].idProceso = liberaRecurso ? undefined : id
                recursos[index].ocupado = liberaRecurso ? false : true
                recursos[index].idHilo = proceso instanceof Hilo ? proceso.idHilo : undefined
              }

            }
            this._recursoService.recursos = recursos
          }
          if (proceso.estado == 'listo') {
            this.procesosListos.update(value => [...value, proceso])
          }
          if (proceso.estado == 'terminado') {
            this._recursoService.recursos.forEach(x => {
              if (proceso.processResources?.includes(x.recurso)) {
                x.idProceso = undefined
                x.idHilo = undefined
                x.ocupado = false
              }
            })
            this.procesosTerminados.update(value => [...value, proceso])
          }
          this.procesosEjecutando.update(value => [...value.filter(x => x.estado == 'ejecutando')])
        }
        else {
          await new Promise(resolve => setTimeout(resolve, 100))
          proceso.setEstado('bloqueado')
          this._recursoService.recursos.forEach(x => {
            if (proceso.processResources?.includes(x.recurso)) {
              x.idProceso = undefined
              x.idHilo = undefined
              x.ocupado = false
            }
          })
          this._procesadorService.liberar(proceso)
          this.procesosBloqueados.update(value => [...value, proceso])
          this.procesosEjecutando.update(value => [...value.filter(x => x.estado == 'ejecutando')])
          // this.actualizarListos()
          // this.actualizarEjecucion()
        }
      }
    }
  }
  actualizarListos() {
    const procesosListos = this.procesosListos()
    let i = 0;
    while (i < procesosListos.length && this._procesadorService.procesadores.some(x => x.proceso == undefined)) {
      const indexProcesador = this._procesadorService.procesadores.findIndex(x => x.proceso == undefined)
      let _proceso = procesosListos[i]
      _proceso.setEstado('ejecutando')
      this._procesadorService.procesadores[indexProcesador].setProceso(_proceso)
      this.procesosEjecutando.update(value => [...value, _proceso])
      this.procesosListos.update(value => [...value.filter(x => x.estado == 'listo')])
      i++;
    }
  }
  actualizarBloqueados() {
    const procesosBloqueados = this.procesosBloqueados();
    const procesosListos = this.procesosListos();
    for (const procesoBloqueado of procesosBloqueados) {
      if (procesoBloqueado) {
        const processResources = procesoBloqueado.processResources
        let flag: boolean = false
        flag = !processResources ? true : this._recursoService.recursos
          .filter(x => processResources.includes(x.recurso))
          .every(x => x.ocupado == false)
        if (flag) {
          procesoBloqueado.setEstado('listo')
          const index = procesosBloqueados.indexOf(procesoBloqueado);
          if (index > -1) {
            procesosBloqueados.splice(index, 1);
            procesosListos.push(procesoBloqueado)
          }
        }
        else if (!this.procesosEjecutando().length && !procesosListos.length) {
          this._recursoService.recursos.forEach(item => {
            item.idProceso = undefined
            item.ocupado = false
          })
          console.log('entro porque procesos ejecutando y listos están vacíos')
        }
      }
    }
    this.procesosBloqueados.update(() => [...procesosBloqueados]);
    this.procesosListos.update(() => [...procesosListos]);
  }
  //TODO: aplicar preeminencia desde aca, con base al numero de procesadores
  actualizarNuevos() {
    const procesosNuevos = this.procesosNuevos();
    procesosNuevos.forEach(proceso => {
      proceso.setEstado('listo')
    })
    const procesosListosNormal = procesosNuevos.filter(x => x.estado == 'listo' && x.preeminencia == undefined)
    const procesosConSinPreeminencia = procesosNuevos.filter(x => x.preeminencia !== undefined)
    .sort((a, b) => {
      if (a.preeminencia === 'si' && b.preeminencia !== 'si') {
        return -1;
      } else if (a.preeminencia !== 'si' && b.preeminencia === 'si') {
        return 1;
      } else {
        return 0;
      }
    })
    const procesosSinPreeminencia = procesosConSinPreeminencia.filter(x => x.preeminencia == 'no')
    this.procesosListos.update(value => [...procesosSinPreeminencia, ...value, ...procesosListosNormal])
    const procesosConPreeminenciaAEjec = procesosConSinPreeminencia.filter(x => x.preeminencia == 'si')
      .slice(0, this._procesadorService.numProcesadores)
    const procesosConPreeminenciaAList = procesosConSinPreeminencia.filter(x => x.preeminencia == 'si')
      .slice(this._procesadorService.numProcesadores)
    this.procesosListos.update(value => [...procesosConPreeminenciaAList, ...value])
    for (let i = 0; i < procesosConPreeminenciaAEjec.length; i++) {
      const proceso = procesosConPreeminenciaAEjec[i];
      proceso.setEstado('ejecutando')
      const procesoEnProcesador = this._procesadorService.procesadores[i].proceso
      this._procesadorService.procesadores[i].setProceso(proceso)
      const procesosEjecutando = this.procesosEjecutando()
      const indexPejec = procesosEjecutando.findIndex(x => (
        (x instanceof Hilo && procesoEnProcesador instanceof Hilo)
          ? x.id == procesoEnProcesador.id && x.idHilo == procesoEnProcesador.idHilo
          : procesoEnProcesador instanceof Proceso && x.id == procesoEnProcesador.id
      ))
      if (indexPejec != -1) {
        procesosEjecutando[indexPejec].setEstado('listo')
        const pListo = procesosEjecutando[indexPejec]
        this.procesosListos.update(value => [...value, pListo])
      }
      this.procesosEjecutando.update(value => [proceso, ...procesosEjecutando.filter(x => x.estado == 'ejecutando')])
    }

    this.procesosNuevos.update(() => [...[]]);
  }

}
