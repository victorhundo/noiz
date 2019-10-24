import { Component, OnInit } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { ElectionService } from 'src/app/services/election.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Election } from 'src/app/models/election.model';
import { Util } from 'src/app/models/util';

declare var b64_sha256: any;

@Component({
  selector: 'app-detail-election',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailElectionComponent implements OnInit {

  shortName: any;
  election: any;
  user: any;
  timer: any;
  isReady = false;

  constructor(
    private electionService: ElectionService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.user = this.authService.getUser();
    this.getElection();
    setInterval(() => { this.getTimer(); }, 100);
  }

  getElection() {
    const results: Observable<any> = this.electionService.getElection(this.shortName);
    results.subscribe( res => {
      this.election = new Election(res);
      this.election.generateHash();
      this.isReady = true;
    });
  }

  canCompute() {
    return this.election.isFreeze() && this.user.isAdmin() && this.election.isStarted();
  }

  canFreeze() {
    return this.user.isAdmin() && !this.election.isFreeze();
  }

  canVerify() {
    return this.election.isEnded();
  }

  canVote() {
    return this.election.isStarted() &&  !this.timeOut();
  }

  canEdit() {
    return this.election.isReady() && this.user.isAdmin();
  }

  getDate(dateString: string) {
    return Util.getDate(dateString);
  }

  freeze() {
    const results: Observable<any> = this.electionService.freezeElection(this.election.uuid, 'freeze');
    results.subscribe( res => {
       location.reload();
    });
  }

  computeTally() {
    const results: Observable<any> = this.electionService.computeTally(this.election.uuid);
    results.subscribe( res => {
        location.reload();
    });
  }

  navigateMenu(choice: string) {
    if (choice === 'edit') {
      this.router.navigate([`/elections/${this.election.short_name}/edit`]);
    }
  }

  getWinner() {
    let bigger = -1;
    let biggerIndex = -1;
    this.election.result[0].result.forEach((element: any, index: number ) => {
      if (element.count_vote > bigger) {
        bigger = element.count_vote;
        biggerIndex = index;
      }
    });
    // console.log(this.election.result[0].result);
    return this.election.result[0].result[biggerIndex].name_answer;
  }

  countBallot() {
    let count = 0;
    this.election.result[0].result.forEach((element: any, index: number ) => {
      count += element.count_vote;
    });
    return count;
  }

  getType() {
    if (this.election.openreg) { return 'Aberta'; }
    return 'Fechada';
  }

  getTimer() {
    const endTime: Date = new Date(Date.parse(this.election.votingEndsAt));
    if ( this.timeOut() ) { this.timer = 'ENCERRADA'; return 'ENCERRADA'; }
    const distance: any = endTime.getTime() - new Date().getTime();
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const output: string =  days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
    // console.log(output);
    this.timer = output;
    return output;
  }

  timeOut() {
    const endTime: Date = new Date(Date.parse(this.election.votingEndsAt));
    return endTime.getTime() < Date.now();
  }

}
