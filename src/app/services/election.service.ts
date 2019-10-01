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

  getElections(): Observable<any>{
    return this.http.get(`${API}/elections/`);
  }

  getElection(id): Observable<any>{
    return this.http.get(`${API}/elections/${id}`);
  }

  voteElection(id, data):Observable<any>{
    return this.http.post(`${API}/elections/${id}/cast/`, data);
  }

  createElection(data): Observable<any>{
    return this.http.post(`${API}/elections/`, data);
  }

  freezeElection(id, data): Observable<any> {
    return this.http.post(`${API}/elections/${id}/freeze/`,data)
  }

  addHelioTrustee(id, data): Observable<any> {
    return this.http.post(`${API}/elections/${id}/trustee/add-helios/`,data)
  }

  eligibility(id,data): Observable<any> {
    return this.http.post(`${API}/elections/${id}/voters/eligibility/`,data)
  }
}
