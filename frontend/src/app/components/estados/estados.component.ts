import { Component, effect, inject, OnInit, Signal, } from '@angular/core';
import { ProcesoService } from '../../services/proceso.service';
import { listaProcesoPorEstado } from '../../models/interfaces/estado';
import { TablaProcesosComponent } from "../tabla-procesos/tabla-procesos.component";
import { Proceso } from '../../models/classes/proceso';
import { ProcessStatus } from '../../models/interfaces/proceso';
import { RecursoService } from '../../services/recurso.service';
import { IResource } from '../../models/interfaces/resource';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-estados',
  standalone: true,
  imports: [TablaProcesosComponent, MatTableModule],
  templateUrl: './estados.component.html',
  styleUrl: './estados.component.scss'
})
export class EstadosComponent implements OnInit {
  readonly _procesoService = inject(ProcesoService)
  readonly _recursosService = inject(RecursoService)
  dataSource = new MatTableDataSource<IResource>(this._recursosService.recursos);
  displayedColumns: string[] = ['recurso', 'idProceso', 'ocupado'];
  procesosNuevos: Signal<Proceso[]>
  procesosListos: Signal<Proceso[]>
  procesosEjecutando: Signal<Proceso[]>
  procesosBloqueados: Signal<Proceso[]>
  procesosTerminados: Signal<Proceso[]>
  estados: ProcessStatus[]
  constructor() {
    this.procesosNuevos = this._procesoService.procesosNuevos
    this.procesosListos = this._procesoService.procesosListos
    this.procesosEjecutando = this._procesoService.procesosEjecutando
    this.procesosBloqueados = this._procesoService.procesosBloqueados
    this.procesosTerminados = this._procesoService.procesosTerminados
    this.estados = ['nuevo', 'listo', 'ejecutando', 'bloqueado', 'terminado' ]
  }
  ngOnInit(): void {
  }

}
