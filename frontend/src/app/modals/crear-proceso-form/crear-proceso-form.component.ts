import { Component, inject, OnInit, signal, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule,  } from '@angular/material/dialog';
import { ProcessForm, ProcessResource } from '../../models/interfaces/proceso';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ProcesoService } from '../../services/proceso.service';
import { Proceso } from '../../models/classes/proceso';

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
  resourcesList: Array<ProcessResource> = ['memory', 'graphicsCard', 'processor', 'hardDrive']
  buildFormCreate() {
    return this._fb.group(
      {
        processName: ['Nuevo proceso', [ Validators.required]],
        processSize: [0, [ Validators.required, Validators.min(1)]],
        processResource: [undefined, [ Validators.required]],
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
  onSubmit(){
    if (this.formCreate.invalid) {
      console.warn('form invalid');
      return
    }
    const _processForm: ProcessForm =  this.formCreate.value
    const {processName, processResource, processSize} = _processForm
    const newProcess: Proceso = new Proceso(processName, processSize, processResource)
    if (!newProcess) {
      console.error('newProcess is undefined')
    }
    this._procesoService.addProcesoToList(newProcess, this._procesoService.procesosNuevos)
  }
  ngOnInit(): void {
  }

}
