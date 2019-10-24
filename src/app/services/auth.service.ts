import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API } from 'src/app/util';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  login(data): Observable<any>{
    return this.http.post(`${API}/auth/password/`, data );
  }

  hasLogged(): Observable<any> {
    return this.http.get(`${API}/auth/check/`);
  }

  public getToken(): any {
    const checkLocalStorage: boolean = localStorage.getItem('token') === null;
    if (checkLocalStorage) { return null; } else {
      return JSON.parse(localStorage.getItem('token'));
    }
  }

  public getUser(): any {
    if (localStorage.getItem('noiz') == null) {
      return null;
    } else {
      return new User(JSON.parse(localStorage.getItem('noiz')).user);
    }
  }
}
