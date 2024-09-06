import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  getTest() {
    return this._http.get<{result: boolean}>(environment.api+'test')
  }

  constructor(private _http: HttpClient) { }
}
