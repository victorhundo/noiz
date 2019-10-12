import { Component, OnInit } from '@angular/core';
import { ElectionService } from 'src/app/services/election.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import unescapeJs from 'unescape-js';
import { EncryptedVote } from 'src/app/models/encryptedVote';

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
  results: any = [];
  overallResult = true;
  tally: any = [];

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

  result_append(s: string) {
    this.results[this.results.length] = s;
  }


  verify() {
    this.results = [];
    this.count = 0;

    this.result_append('eleição carregada: ' + this.election.name);
    this.result_append('código de identificação da eleição: ' + this.election.election_hash);

    this.questions.forEach((q: any, index: number) => {
      if ( !(q.tally_type === 'homomorphic' )) {
        this.result_append(
          'PROBLEMA: esta eleição não é uma eleição de apuração \
          homomórfica direta. Portanto,o Helios não pode verificá-la.');
        return;
      }

      this.tally[index] = q.answers.map((anum: any, a: any) => {
        return 1;
      });
    });

    this.result_append('carregando lista de eleitores...');
    const results: Observable<any> = this.electionService.getBallots(this.shortName);
    results.subscribe((res: any) => {
      const listBallots: any = [];
      this.result_append('lista de eleitores carregada, agora carregando a cédula de cada um..');

      res.message.forEach((ballot: any) => {
        const getBallot: Observable<any> = this.electionService.getLastBallot(this.shortName, ballot.voter_uuid);
        listBallots[listBallots.length] = getBallot;
      });

      forkJoin(listBallots).subscribe((lastBallots: any) => {
        this.result_append('Cédulas:');
        lastBallots.forEach((castVote: any) => {
          this.doVerify(castVote.message);
        });
      });

    });
  }

  doVerify(castVote: any) {
    if (castVote.vote == null) { return; }

    const vote: any = EncryptedVote.fromJSONObject(castVote.vote, this.election);
    const voteTohash: any = EncryptedVote.fromJSONObject(castVote.vote, this.election); /* FIX ME */
    this.result_append('Eleitor #' + this.count++);
    this.result_append('-- UUID: ' + castVote.voter_uuid);
    this.result_append('-- Número de Rastreamento da Cédula: ' + this.getHash(voteTohash));
    vote.verifyProof(this.election.public_key,
      (answerNum: any, choiceNum: any, result: any, choice: any) => {
        this.overallResult = this.overallResult && result;
        if (choiceNum != null) {
          // keep track of tally
          this.tally[answerNum][choiceNum] = choice.multiply(this.tally[answerNum][choiceNum]);
          this.result_append('Questão #' + (answerNum + 1) + ', Opção #' + (choiceNum + 1) + ' -- ' + result);
      } else {
          this.result_append('Questão #' + (answerNum + 1) + ' GLOBAL -- ' + result);
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
