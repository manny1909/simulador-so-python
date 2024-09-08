import { ChangeDetectionStrategy, Component, OnInit, Signal } from '@angular/core';
import { CrearProcesoFormComponent } from '../../modals/crear-proceso-form/crear-proceso-form.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ProcesoService } from '../../services/proceso.service';
import { CommonModule } from '@angular/common';
import { Proceso } from '../../models/classes/proceso';
import { TablaProcesosComponent } from "../tabla-procesos/tabla-procesos.component";
@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [MatButtonModule, CommonModule, TablaProcesosComponent],
  templateUrl: './procesos.component.html',
  styleUrl: './procesos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcesosComponent implements OnInit{
  procesos:Signal<Proceso[]>
  constructor(
    private dialog:MatDialog,
    private _procesoService:ProcesoService
  ){
    this.procesos = this._procesoService.todosLosProcesos
  }
  ngOnInit(): void {
  }
  openDialog() {
    this.dialog.open(CrearProcesoFormComponent);
  }

}
