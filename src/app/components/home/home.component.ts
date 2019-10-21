import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ElectionService } from 'src/app/services/election.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: any;
  elections: any;
  isReady = false;
  mainElection: any = {name: '', description: '' };
  electionsEnded: any;
  electionsReady: any;
  electionsStarted: any;
  electionsFiltered: any = [
    {
      name: 'Encerrada',
      election: this.electionsEnded
    },
    {
      name: 'Pronta',
      election: this.electionsReady
    },
    {
      name: 'Ativa',
      election: this.electionsStarted
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private electionService: ElectionService,
    private location: Location) {
      const hasLogged: Observable<any> = this.authService.hasLogged();
      const getElections: Observable<any> = this.electionService.getElections();
      const rejectLogged = hasLogged.pipe(catchError(error => of(error)));
      getElections.pipe(catchError(error => of(error)));
      forkJoin(hasLogged, getElections).subscribe(([res1, res2]) => {
        this.authHandling(res1);
        this.electionHandling(res2);
      });
    }

    ngOnInit() {
      this.user = this.authService.getUser();
    }

  

  authHandling(res: any) {
    if (!res.message.hasLogged) {
      localStorage.clear();
      this.router.navigate(['login']);
   }
  }

  updateFilter() {
    this.electionsFiltered[0].election = this.elections.filter(this.isEnd);
    this.electionsFiltered[1].election = this.elections.filter(this.isElectionReady);
    this.electionsFiltered[2].election = this.elections.filter(this.isElectionStated);
  }

  needAdmin(f: any) {
    if (f.name === 'Pronta') {
      return this.hasAdmin();
    }
    return true;
  }

  electionHandling(res: any) {
    this.elections = res;
    this.updateFilter();
    if (res.length > 0) {
      this.mainElection = res[0];
    }
    this.isReady = true;
  }

  isElectionReady(e: any) {
    return e.frozen_at === null;
  }

  isElectionStated(e: any) {
    const endTime: Date = new Date(Date.parse(e.voting_ends_at));
    const isReady = e.frozen_at === null;
    const isEnded = endTime.getTime() < Date.now();
    return !isReady && !isEnded;
  }

  hasAdmin() {
    return this.user.admin_p;
  }

  hasElection() {
    return this.elections.length > 0;
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }

  getElections() {
    const results: Observable<any> = this.electionService.getElections();
    results.subscribe( res => {
       this.elections = res;
       if (res.length > 0) {
         this.mainElection = res[0];
       }
       console.log(this.mainElection);
    });
  }

  getTime(dateString: string){
    const date: Date = new Date(Date.parse(dateString));
    return date.toLocaleString('pt-br').split('.')[0];
  }

  freeze() {
    const results: Observable<any> = this.electionService.freezeElection(this.mainElection.uuid, 'freeze');
    results.subscribe( res => {
       console.log(res);
       location.reload();
    });
  }

  isNotFreeze() {
    return this.mainElection.frozen_at === null;
  }

  changeMainElection(e: any) {
    this.mainElection = e;
  }

  isEnd(e: any) {
    const endTime: Date = new Date(Date.parse(e.voting_ends_at));
    return endTime.getTime() < Date.now();
  }

  elecitonIsEnd(date: string) {
    const endTime: Date = new Date(Date.parse(date));
    if (endTime.getTime() < Date.now()) {
      return 'Encerrada.';
    } else {
      return 'Encerramento: '  + endTime.toLocaleString('pt-br').split('.')[0];
    }
  }

  canCompute() {
    return !this.isNotFreeze() && this.hasAdmin();
  }

  compute_tally() {
    const results: Observable<any> = this.electionService.computeTally(this.mainElection.uuid);
    results.subscribe( res => {
        location.reload();
    });
  }

}
