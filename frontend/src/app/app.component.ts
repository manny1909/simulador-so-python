import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabsComponent } from "./layouts/tabs/tabs.component";
import { ProcesoService } from './services/proceso.service';
import { ProcesadorService } from './services/procesador.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  readonly _procesoService = inject(ProcesoService)
  readonly _procesadorService = inject(ProcesadorService)
  readonly _cdr = inject(ChangeDetectorRef)
  procesos = this._procesoService.procesosNuevos
  idIntervaloSimProcesos: any
  constructor() {

  }
  ngOnInit(): void {
    this._procesoService.test()
    // this.idIntervaloSimProcesos = this.startProcessesSimulation()
  }
  startProcessesSimulation(): number{
    return setInterval(async () => {
      await this._procesoService.actualizarProcesos()
      // console.log('hola')
      // this._cdr.detectChanges()
    }, 4000*(this._procesadorService.numProcesadores??1));
  }
  stopProcessSimulation(){
    clearInterval(this.idIntervaloSimProcesos)
    this._procesoService.resetProcess()
  }
}
