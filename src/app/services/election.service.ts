import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    return this.http.get(`${API}/elections/${id}/`);
  }

  voteElection(id, data):Observable<any>{
    return this.http.post(`${API}/elections/${id}/cast/`, data);
  }

  createElection(data): Observable<any>{
    return this.http.post(`${API}/elections/`, data);
  }

  updateElection(id, data): Observable<any>{
    return this.http.put(`${API}/elections/${id}/`, data);
  }

  freezeElection(id): Observable<any> {
    return this.http.post(`${API}/elections/${id}/freeze/`, 'data');
  }

  registryVoters(id): Observable<any> {
    return this.http.post(`${API}/elections/${id}/votersfile/registry/`, 'data');
  }

  getVoters(id): Observable<any> {
    return this.http.get(`${API}/elections/${id}/voters/`);
  }

  getVoterFile(id): Observable<any> {
    return this.http.get(`${API}/elections/${id}/votersfile/`);
  }

  addHelioTrustee(id, data): Observable<any> {
    return this.http.post(`${API}/elections/${id}/trustee/add-helios/`,data)
  }

  eligibility(id,data): Observable<any> {
    return this.http.post(`${API}/elections/${id}/eligibility/`,data)
  }

  computeTally(id:string): Observable<any> {
    return this.http.post(`${API}/elections/${id}/compute_tally/`,{})
  }

  addVoters(id:string,data:any): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('content-type', 'multipart/form-data')
    // headers = headers.append('zumo-api-version', '2.0.0');
    return this.http.post(`${API}/elections/${id}/votersfile/`,data)
  }

  getBallots(id: string): Observable<any> {
    return this.http.get(`${API}/elections/${id}/ballots/`);
  }

  getLastBallot(idElection: string, idVoter: string): Observable<any> {
    return this.http.get(`${API}/elections/${idElection}/ballots/${idVoter}/last/`);
  }
}
