import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ElectionService } from 'src/app/services/election.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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
  }

  getElection() {
    const results: Observable<any> = this.electionService.getElection(this.shortName);
    results.subscribe( res => {
       this.election = res;
       this.election.hash = b64_sha256(this.toUnicode(JSON.stringify(this.election)));
       this.isReady = true;
    });
  }
  
  toUnicode(s: string) {
    return s.replace(/[\u007F-\uFFFF]/g, (chr) => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
    });
  }

  getTime(dateString: string){
    const date: Date = new Date(Date.parse(dateString));
    return date.toLocaleString('pt-br').split('.')[0];
  }

  freeze() {
    const results: Observable<any> = this.electionService.freezeElection(this.election.uuid, 'freeze');
    results.subscribe( res => {
       console.log(res);
       location.reload();
    });
  }

  hasAdmin() {
    return this.user.admin_p;
  }

  canCompute() {
    return !this.isNotFreeze() && this.hasAdmin();
  }

  isNotFreeze() {
    return this.election.frozen_at === null;
  }

  compute_tally() {
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

}
