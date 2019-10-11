import { Component, OnInit } from '@angular/core';
import { ElectionService } from 'src/app/services/election.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import unescapeJs from 'unescape-js';

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
  pk: any = {};
  results: any = [];

  constructor(
    private electionService: ElectionService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.getElection();
  }

  private dateTimeFormat(a: string) {
    a = a.replace('.000000', '');
    return a.slice(0, (a.length - 2)) + ':' + a.slice(-2);
  }

  private normalizeUnicode(a: string) {
    a = unescapeJs(a);
    a = a.replace(/u'/g, '\'').replace(/'/g, '"');
    const result: any = [];
    JSON.parse(decodeURIComponent(a)).forEach((e: any) => {
      result.push({
        answer_urls: e.answer_urls,
        answers: e.answers,
        choice_type: e.choice_type,
        max: e.max,
        min: e.min,
        question: e.question,
        result_type: e.result_type,
        tally_type: e.tally_type
      });
    });
    return result;
  }

  private getQuestions(c: any) {
    const questions: any = [];
    c.forEach(q => {
      const answerUrls: any = [];
      const theAnswers: any = [];

      q.answer_urls.forEach(e => {
        answerUrls.push(e.answer_urls)
      });

      q.answers.forEach(e => {
        theAnswers.push(e.answer)
      });

      questions.push( {
        answer_urls: answerUrls,
        answers: theAnswers,
        choice_type: q.choice_type,
        max: q.max,
        min: q.min,
        question: q.question,
        result_type: q.result_type,
        tally_type: q.tally_type
      });
    });
    return questions;
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
       this.election = res;
       this.election.frozen_at = this.dateTimeFormat(res.frozen_at);
       this.election.voting_ends_at = this.dateTimeFormat(res.voting_ends_at); 
       this.election.voting_starts_at = this.dateTimeFormat(res.voting_starts_at);
       const key = JSON.parse(res.public_key);
       this.election.questions = this.normalizeUnicode(this.election.questions);
       this.questions = this.getQuestions(this.election.questions);
       this.pk.g = key.g;
       this.pk.p = key.p;
       this.pk.q = key.q;
       this.pk.y = key.y;
       this.election.public_key = this.pk;
       this.election.hash = b64_sha256(this.toUnicode(JSON.stringify(this.election)));
       this.election.election_hash = this.election.hash;
       this.election.public_key = this.keyBigInt(this.pk);
    });
  }


  verify() {
    const tally: any = [];

    this.questions.forEach((q: any, index: number) => {
      if ( !(q.tally_type === 'homomorphic' )) {
        this.results[this.results.length] =
        'PROBLEMA: esta eleição não é uma eleição de apuração homomórfica direta. Portanto,o Helios não pode verificá-la.';
        return;
      }

      tally[index] = q.answers.map((anum: any, a: any) => {
        return 1;
      });
    });

    this.results[this.results.length] = 'carregando lista de eleitores...';
    const results: Observable<any> = this.electionService.getBallot(this.shortName);
    results.subscribe((res: any) => {
      console.log(res);
    })

  }



}
