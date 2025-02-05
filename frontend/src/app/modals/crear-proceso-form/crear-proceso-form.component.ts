import { Component, inject, OnInit, signal, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, } from '@angular/material/dialog';
import { ProcessForm, ProcessResource, Preeminencia } from '../../models/interfaces/proceso';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ProcesoService } from '../../services/proceso.service';
import { Proceso } from '../../models/classes/proceso';
import { randomInt } from '../../util/iutil';

@Component({
  selector: 'app-crear-proceso-form',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, ReactiveFormsModule,
    CommonModule, MatSelectModule, MatInputModule,
  ],
  templateUrl: './crear-proceso-form.component.html',
  styleUrl: './crear-proceso-form.component.scss'
})
export class CrearProcesoFormComponent implements OnInit {
  formCreate: FormGroup;
  proceso = signal<ProcessForm | undefined>(undefined)
  readonly _fb = inject(FormBuilder)
  resourcesList: Array<ProcessResource> = ['memory', 'graphicsCard', 'processor', 'hardDrive', 'micrófono']
  preeminenciaList: Array<Preeminencia> = ['si', 'no', undefined]
  buildFormCreate() {
    return this._fb.group(
      {
        processName: ['Proceso A', [Validators.required]],
        processSize: [1, [Validators.required, Validators.min(1)]],
        processResource: [undefined, [Validators.required]],
        preeminence: [undefined, []],
      },
      {}
    )
  }
  constructor(
    private _procesoService: ProcesoService
  ) {
    this.formCreate = this.buildFormCreate()
  }
  updateProceso() {
    this.proceso.update((value) => value)
  }
  onSubmit() {
    if (this.formCreate.invalid) {
      console.warn('form invalid');
      return
    }
    const _processForm: ProcessForm = this.formCreate.value
    const { processName, processResource, processSize, preeminence: preeminencia } = _processForm
    const idProceso = this.getRandom()
    const newProcess: Proceso = new Proceso(processName, processSize, processResource, 'nuevo', idProceso, preeminencia)
    const todosLosProcesos = this._procesoService.todosLosProcesos()
    if (!newProcess) {
      console.error('newProcess is undefined')
      return
    }
    if (todosLosProcesos.some(x => x.processName === newProcess.processName)) {
      console.error('el nombre del nuevo proceso ya existe')
      return
    }
    this._procesoService.agregarProcesoANuevos(newProcess, true)
  }
  getRandom(): number {
    const idRandom = randomInt()
    const i = this._procesoService.todosLosProcesos().findIndex(x => x.id == idRandom)
    return i != -1 ? this.getRandom() : idRandom
  }
  ngOnInit(): void {
  }

}
