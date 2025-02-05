import { Component, effect, inject, OnInit, Signal, } from '@angular/core';
import { ProcesoService } from '../../services/proceso.service';
import { listaProcesoPorEstado } from '../../models/interfaces/estado';
import { TablaProcesosComponent } from "../tabla-procesos/tabla-procesos.component";
import { Proceso } from '../../models/classes/proceso';
import { ProcessStatus } from '../../models/interfaces/proceso';
import { RecursoService } from '../../services/recurso.service';
import { IResource } from '../../models/interfaces/resource';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProcesadorService } from '../../services/procesador.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-estados',
  standalone: true,
  imports: [MatButtonModule, TablaProcesosComponent, MatTableModule],
  templateUrl: './estados.component.html',
  styleUrl: './estados.component.scss'
})
export class EstadosComponent implements OnInit {
  readonly _procesoService = inject(ProcesoService)
  readonly _procesadorService = inject(ProcesadorService)
  readonly _recursosService = inject(RecursoService)
  dataSource = new MatTableDataSource<IResource>(this._recursosService.recursos);
  displayedColumns: string[] = ['recurso', 'idProceso', 'ocupado'];
  estados: ProcessStatus[]
  idIntervaloSimProcesos: any
  constructor() {
    this.estados = ['nuevo', 'listo', 'ejecutando', 'bloqueado', 'terminado' ]
  }
  ngOnInit(): void {
  }
  async ejec(){
    await this._procesoService.actualizarProcesos()
  }
  startProcessesSimulation(): number{
    this.idIntervaloSimProcesos = setInterval(async () => {
      console.log(this._procesoService.todosLosProcesos())
      await this._procesoService.actualizarProcesos()
    }, 4000*(this._procesadorService.numProcesadores??1));
    return this.idIntervaloSimProcesos
  }
  stopProcessSimulation(){
    clearInterval(this.idIntervaloSimProcesos)
    // this._procesoService.resetProcess()
  }
}
