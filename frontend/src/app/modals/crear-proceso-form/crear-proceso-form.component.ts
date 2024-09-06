import { Component, inject, OnInit, signal, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { ProcessForm, ProcessResource } from '../../models/interfaces/proceso';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatOption, MatOptionModule } from '@angular/material/core';
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
    const newProcess: ProcessForm =  this.formCreate.value
    if (!newProcess) {
      console.error('newProcess is undefined')
    }
    this.proceso.update(() => {
      return newProcess
    })
    this._procesoService.procesos.update((value) => [...value, newProcess])
  }
  ngOnInit(): void {
    this.proceso.update(() => this.formCreate.value)
    console.log(this.proceso())
  }

}
