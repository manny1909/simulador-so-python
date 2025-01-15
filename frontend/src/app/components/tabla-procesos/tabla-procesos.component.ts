import { ChangeDetectorRef, Component, effect, Input, OnInit, Signal, ViewEncapsulation } from '@angular/core';
import { Proceso } from '../../models/classes/proceso';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProcessStatus } from '../../models/interfaces/proceso';

@Component({
  selector: 'app-tabla-procesos',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './tabla-procesos.component.html',
  styleUrls: ['./tabla-procesos.component.scss']
})
export class TablaProcesosComponent implements OnInit {
 @Input('procesos') procesos!: Signal<Proceso[]>
 @Input('estado') estado: ProcessStatus | undefined
 displayedColumns: string[] = ['id', 'name', 'weight', 'pending', 'resource', 'status'];
 dataSource = new MatTableDataSource<Proceso>();
  constructor(private _changeDetectorRef: ChangeDetectorRef){
    effect(() => {
      const updatedData = this.procesos();
      this.dataSource.data = updatedData;
      _changeDetectorRef.detectChanges()
    });
  }
  ngOnInit(): void {

  }
}
