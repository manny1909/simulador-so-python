import { Component } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs'
import { ProcesosComponent } from "../../components/procesos/procesos.component";
import { EstadosComponent } from "../../components/estados/estados.component";
import { MemoriaComponent } from '../../components/memoria/memoria.component';
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [MatTabsModule, ProcesosComponent, EstadosComponent, MemoriaComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {

}
