import { Component, OnInit, Inject } from '@angular/core';
import { Observable, interval, forkJoin } from 'rxjs';
import { ElectionService } from 'src/app/services/election.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Election } from 'src/app/models/election.model';
import { Util } from 'src/app/models/util';
import { SuccessdialogService } from 'src/app/services/successdialog.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


declare var b64_sha256: any;

@Component({
  selector: './app-dialog-confirm',
  templateUrl: './dialog-confirm.html',
  styleUrls: ['./detail.component.scss']
})
export class DialogConfirmComponent {
  title: string;
  subtitle: string;
  action: string;
  paragraphs: any = [];
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data === 'freeze') {
      this.title = 'Congelar Eleição?';
      this.subtitle = 'Ao congelar a eleição você terá as seguintes consequências:';
      this.action = 'Congelar';
      this.paragraphs.push('- Não será mais permitido editar a eleição');
      this.paragraphs.push('- Caso seja uma eleição fechada, os eleitores serão notificados');
      this.paragraphs.push('- A eleição terá inicio');
    }
    if (data === 'compute') {
      this.title = 'Computar Votos?';
      this.subtitle = 'Ao computar os votos você terá as seguintes consequências:';
      this.action = 'Computar';
      this.paragraphs.push('- Não será mais permitido votar nessa eleição');
      this.paragraphs.push('- O tempo de computação pode levar horas depedendo da quantidade de votos cifrados depositado');
      this.paragraphs.push('- Após a computação a eleição será encerrada');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

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
    private authService: AuthService,
    private sucessDialog: SuccessdialogService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.user = this.authService.getUser();
    this.getElection();
  }

  success(message: string) {
    this.sucessDialog.open(message, 'Fechar');
  }

  getElection() {
    const results: Observable<any> = this.electionService.getElection(this.shortName);
    results.subscribe( res => {
      this.election = new Election(res);
      this.election.generateHash();
      setInterval(() => { this.getTimer(); }, 100);
      this.isReady = true;
    });
  }

  openDialogConfirm(action: string) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '600px',
      data: action
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( result === 'freeze') {
        this.freeze();
      } else if ( result === 'compute') {
        this.computeTally();
      }
    });
  }

  canVoters() {
    return !this.election.isOpen() || this.election.isEnded();
  }

  canCompute() {
    return this.election.isFreeze() && this.user.isAdmin() && this.election.isStarted() && !this.election.tallyingStartedAt;
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
    if (this.election.openreg) {
      this.electionService.freezeElection(this.election.uuid).subscribe((res: any) => {
        this.success('Eleição Iniciada!');
        this.ngOnInit();
      });
    } else {
      const freezeElection: Observable<any> = this.electionService.freezeElection(this.election.uuid);
      const registryVoters: Observable<any> = this.electionService.registryVoters(this.election.uuid);
      registryVoters.subscribe( (resRegisty: any) => {
        freezeElection.subscribe( (resFreeze: any) => {
          this.success('Eleição Iniciada!');
          this.ngOnInit();
        });
      });
    }
  }

  computeTally() {
    const results: Observable<any> = this.electionService.computeTally(this.election.uuid);
    results.subscribe( res => {
      this.success('Apuração Iniciada!');
      this.ngOnInit();
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
    if ( this.election.tallyingStartedAt ) {
      this.timer = 'COMPUTANDO VOTOS...'; return 'COMPUTANDO VOTOS...';
    } else if ( this.timeOut() ) { this.timer = 'ENCERRADA'; return 'ENCERRADA'; }
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

