import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabsComponent } from "./layouts/tabs/tabs.component";
import { ProcesoService } from './services/proceso.service';
import { RecursoService } from './services/recurso.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  readonly _procesoService = inject(ProcesoService)
  readonly _recursoService = inject(RecursoService)
  procesos = this._procesoService.procesosNuevos
  recursos = this._recursoService.recursos
  idIntervaloSimProcesos: any
  constructor() {

  }
  ngOnInit(): void {
    this.idIntervaloSimProcesos = this.startProcessesSimulation()
  }
  startProcessesSimulation(): number{
    this.recursos.forEach((recurso) => {
      const proceso = this._procesoService.procesosEjecutando().find(x=> x.processResource == recurso.recurso)
      if (proceso) {
        recurso.idProceso = proceso.id
        recurso.ocupado = true
      }
     })
    return setInterval(() => {
      this._procesoService.actualizarProcesos()
      // console.log('hola')
    }, 500);
  }
  stopProcessSimulation(){

  }
}
