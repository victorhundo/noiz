import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,ParamMap } from '@angular/router';
import { ElectionService } from 'src/app/services/election.service';
import {FormBuilder, FormGroup, Validators, FormArray, SelectMultipleControlValueAccessor} from '@angular/forms';
import { Observable } from 'rxjs';
import { EncryptedVote } from 'src/app/models/encryptedVote';
import unescapeJs from 'unescape-js';
import { MatStepper } from '@angular/material';
import { sortObj } from 'sort-object';

declare var b64_sha256: any;
declare var BigInt: any;

@Component({
  selector: 'app-booth',
  templateUrl: './booth.component.html',
  styleUrls: ['./booth.component.scss']
})
export class BoothComponent implements OnInit {
  shortName: string;
  election: any = {};
  questions: any = [];
  eg: any;
  pk: any = {};
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  encryptedBooth: any;
  encryptedVoteHash: any;
  encrypting = false;

  constructor(
    private formBuilder: FormBuilder,
    private electionService: ElectionService,
    private route: ActivatedRoute,
    private router: Router
    ) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.getElection();
    this.firstFormGroup = this.formBuilder.group({
      answer: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  goForward(stepper: MatStepper, isDisable?: boolean) {
    if (!isDisable) { stepper.next(); }
  }

  goBack(stepper: MatStepper, isDisable?: boolean) {
    if (!isDisable) { stepper.previous(); }
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

  private dateTimeFormat(a: string) {
    a = a.replace('.000000', '');
    return a.slice(0, (a.length - 2)) + ':' + a.slice(-2);
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

  toUnicode(s: string) {
    return s.replace(/[\u007F-\uFFFF]/g, (chr) => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
    });
  }

  keyBigInt(s: any) {
    return {
      g: new BigInt(s.g),
      p: new BigInt(s.p),
      q: new BigInt(s.q),
      y: new BigInt(s.y),
    };
  }

  getAnswer() {
    return parseInt(this.firstFormGroup.get('answer').value, 10);
  }

  submit() {
    const results: Observable<any> = this.electionService.voteElection(this.election.uuid, this.encryptedBooth);
    results.subscribe( res => {
        if (res.status === 200) { this.router.navigate(['']); }
    });
  }

  doEncrypted(stepper: MatStepper) {
    this.encrypting = true;
    this.encryptedBooth = this.encrypted_vote();
    this.encryptedVoteHash = b64_sha256(this.encryptedBooth);
    this.goForward(stepper);
    this.encrypting = false;
  }

  encrypted_vote() {
    const encryptedBooth = new EncryptedVote([[this.getAnswer()]], this.election);
    delete encryptedBooth.election;
    encryptedBooth.encrypted_answers.forEach(element => {
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
        c.forEach((p: any) => {
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


      element.overall_proof.forEach((p: any) => {
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
    return JSON.stringify({
      answers: encryptedBooth.encrypted_answers,
      election_hash: encryptedBooth.election_hash,
      election_uuid: encryptedBooth.election_uuid
    });
  }


}
