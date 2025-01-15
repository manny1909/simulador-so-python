import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabsComponent } from "./layouts/tabs/tabs.component";
import { ProcesoService } from './services/proceso.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  readonly _procesoService = inject(ProcesoService)
  readonly _cdr = inject(ChangeDetectorRef)
  procesos = this._procesoService.procesosNuevos
  idIntervaloSimProcesos: any
  constructor() {

  }
  ngOnInit(): void {
    this.idIntervaloSimProcesos = this.startProcessesSimulation()
    // this._procesoService.actualizarProcesos()
  }
  startProcessesSimulation(): number{
    return setInterval(() => {
      this._procesoService.actualizarProcesos()
      // console.log('hola')
      this._cdr.detectChanges()
    }, 3000);
  }
  stopProcessSimulation(){
    clearInterval(this.idIntervaloSimProcesos)
  }
}
