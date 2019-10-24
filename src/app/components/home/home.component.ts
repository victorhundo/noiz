import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ElectionService } from 'src/app/services/election.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Election } from 'src/app/models/election.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: any;
  elections: any = [];
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

  electionHandling(res: any) {
    res.forEach((e: any) => {
      this.elections.push(new Election(e));
    });
    this.updateFilter();
    this.isReady = true;
  }

  updateFilter() {
    this.electionsFiltered[0].election = this.elections.filter((e: any) => e.isEnded());
    this.electionsFiltered[1].election = this.elections.filter((e: any) => e.isReady());
    this.electionsFiltered[2].election = this.elections.filter((e: any) => e.isStarted());
  }

  needAdmin(f: any) {
    if (f.name === 'Pronta') {
      return this.hasAdmin();
    }
    return true;
  }

  hasAdmin() {
    return this.user.isAdmin();
  }

  hasElection() {
    return this.elections.length > 0;
  }

}
