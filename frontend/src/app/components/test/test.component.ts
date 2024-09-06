import { Component, OnInit } from '@angular/core';
import { TestService } from '../../services/test.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit{
  texto: string = 'texto';
 constructor(
  private _testService:TestService
 ){}
  ngOnInit(): void {
    this._testService.getTest().subscribe({
      next: (response) => {
        this.texto = `La respuesta es ${response.result}`
       }
    })
  }
}
