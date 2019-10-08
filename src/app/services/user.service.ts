import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from 'src/app/util';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }

  public getUsers(): Observable<any>{
    return this.http.get(`${API}/users/`);
  }

  public getUser(id:any): Observable<any>{
    return this.http.get(`${API}/users/${id}/`);
  }

  public postUser(user:any): Observable<any>{
    return this.http.post(`${API}/users/`,user);
  }
}
