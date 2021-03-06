import { Component, OnInit } from '@angular/core';
import { ElectionService } from 'src/app/services/election.service';
import { LoggerService } from 'src/app/services/logger.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import unescapeJs from 'unescape-js';
import { EncryptedVote } from 'src/app/models/encryptedVote';
import { Election } from 'src/app/models/election.model';

declare var b64_sha256: any;
declare var BigInt: any;

@Component({
  selector: 'app-verifier',
  templateUrl: './verifier.component.html',
  styleUrls: ['./verifier.component.scss']
})
export class VerifierComponent implements OnInit {
  shortName: string;
  election: any = {};
  questions: any = [];
  count = 0;
  pk: any = {};
  displayedColumns: any = ["log"];
  overallResult = true;
  tally: any = [];
  nAnswers = 0;
  showTable = false;

  constructor(
    private electionService: ElectionService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggerService) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.getElection();
  }

  keyBigInt(s: any) {
    return {
      g: new BigInt(s.g),
      p: new BigInt(s.p),
      q: new BigInt(s.q),
      y: new BigInt(s.y),
    };
  }

  toUnicode(s: string) {
    return s.replace(/[\u007F-\uFFFF]/g, (chr) => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
    });
  }

  getElection() {
    const results: Observable<any> = this.electionService.getElection(this.shortName);
    results.subscribe( res => {
       this.election = new Election(res);
       this.pk = this.election.publicKey;
       this.questions = this.election.questions;
       this.election.generateHash();
       this.nAnswers = this.election.questions[0].answers;
    });
  }

  verify() {
    this.showTable = true;
    this.logger.reset();
    this.count = 0;

    this.questions.forEach((q: any, index: number) => {
      if ( !(q.tally_type === 'homomorphic' )) {
        this.logger.append(
          'PROBLEMA: esta eleição não é uma eleição de apuração \
          homomórfica direta. Portanto,o Helios não pode verificá-la.');
        return;
      }

      this.tally[index] = q.answers.map((anum: any, a: any) => {
        return 1;
      });
    });

    // this.logger.append('carregando lista de eleitores...');
    const results: Observable<any> = this.electionService.getBallots(this.shortName);
    results.subscribe((res: any) => {
      const listBallots: any = [];
      // this.logger.append('lista de eleitores carregada, agora carregando a cédula de cada um..');

      res.message.forEach((ballot: any) => {
        this.electionService.getLastBallot(this.shortName, ballot.voter_uuid).subscribe(castVote => {
          this.doVerify(castVote.message);
        });
      });
    });
  }

  doVerify(castVote: any) {
    if (castVote.vote == null) { return; }

    const vote: any = EncryptedVote.fromJSONObject(castVote.vote, this.election);
    const voteTohash: any = EncryptedVote.fromJSONObject(castVote.vote, this.election); /* FIX ME */
    const voteHash = this.getHash(voteTohash);
    this.logger.append(voteHash);
    vote.verifyProof(this.election.publicKey,
      (answerNum: any, choiceNum: any, result: any, choice: any) => {
        this.overallResult = this.overallResult && result;
        if (choiceNum != null) {
          // keep track of tally
          this.tally[answerNum][choiceNum] = choice.multiply(this.tally[answerNum][choiceNum]);
          this.logger.postResult(voteHash, result, choiceNum);
          // this.logger.append('Questão #' + (answerNum + 1) + ', Opção #' + (choiceNum + 1) + ' -- ' + result);
      } else {
          // this.logger.append('Questão #' + (answerNum + 1) + ' GLOBAL -- ' + result);
      }
    });
  }

  getHash(vote: any) { /* FIX ME */
    vote.encrypted_answers.forEach((element: any) => {
      const individualProofsSorted: any = [];
      const overallProofSorted: any = [];
      delete element.answer;
      delete element.randomness;

      element.choices.forEach((c: any) => {
        c.alpha = c.alpha.toString();
        c.beta = c.beta.toString();
        delete c.pk;
      });

      element.individual_proofs.forEach((c: any) => {
        const proofSorted: any = [];
        c.proofs.forEach((p: any) => {
          p.challenge = p.challenge.toString();
          p.commitment.A = p.commitment.A.toString();
          p.commitment.B = p.commitment.B.toString();
          p.response = p.response.toString();
          proofSorted.push({
            challenge: p.challenge,
            commitment: {
              A: p.commitment.A,
              B: p.commitment.B,
            },
            response: p.response
          });
        });
        individualProofsSorted.push(proofSorted);
      });


      element.overall_proof.proofs.forEach((p: any) => {
        p.challenge = p.challenge.toString();
        p.commitment.A = p.commitment.A.toString();
        p.commitment.B = p.commitment.B.toString();
        p.response = p.response.toString();
        overallProofSorted.push({
          challenge: p.challenge,
          commitment: {
            A: p.commitment.A,
            B: p.commitment.B,
          },
          response: p.response
        });
      });

      element.individual_proofs = individualProofsSorted;
      element.overall_proof = overallProofSorted;

    });

    const objString: string = JSON.stringify({
      answers: vote.encrypted_answers,
      election_hash: vote.election_hash,
      election_uuid: vote.election_uuid
    });
    return b64_sha256(objString);
  }

}
