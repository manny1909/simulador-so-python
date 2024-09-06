import { Component } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs'
import { ProcesosComponent } from "../../components/procesos/procesos.component";
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [MatTabsModule, ProcesosComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {

}
