import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API } from 'src/app/util';


@Injectable({
  providedIn: 'root'
})
export class ElectionService {

  constructor(private http:HttpClient) { }

  createElection(data): Observable<any>{
    return this.http.post(`${API}/elections/`, data);
  }
}
