import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ElectionService } from 'src/app/services/election.service';
import { Observable, forkJoin } from 'rxjs';
import { Election } from 'src/app/models/election.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-voter',
  templateUrl: './voter.component.html',
  styleUrls: ['./voter.component.scss']
})
export class VoterComponent implements OnInit {
  shortName: string;
  user: any;
  election: any;
  voterFile: any;
  voters: any;
  isReady = false;
  displayedColumns: any = ['name', 'username'];

  constructor(
    private electionService: ElectionService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.user = this.authService.getUser();
    this.getElection();
  }

  getElection() {
    this.electionService.getElection(this.shortName).subscribe( res => {
      this.election = new Election(res);

      const requests: any = [];
      requests.push(this.electionService.getVoters(this.shortName));
      if (!this.election.isFreeze()) {
        requests.push(this.electionService.getVoterFile(this.shortName));
      }

      forkJoin(requests).subscribe( (results: any) => {
        if (results.length > 1) { this.voterFile = results[1].message.voter_file_content; }
        this.voters = results[0].message;
        this.isReady = true;
      });

    });
  }

}
