import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  private apiUrl = 'http://localhost:8080/api/voluntario';

  constructor(private http: HttpClient) {}

  obtenerTareas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tareas`);
  }
}