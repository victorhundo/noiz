import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API } from 'src/app/util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  login(data): Observable<any>{
    return this.http.post(`${API}/auth/password/`, data );
  }

  hasLogged(): Observable<any>{
    return this.http.get(`${API}/auth/check`);
  }

  public getToken(): any {
    if (localStorage.getItem('noiz') == null) return null
    return JSON.parse(localStorage.getItem('noiz'))["token"];
  }

  public getUser(): any {
    if (localStorage.getItem('noiz') == null) return null
    return JSON.parse(localStorage.getItem('noiz'))["user"];
  }
}
