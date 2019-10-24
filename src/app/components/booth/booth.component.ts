import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,ParamMap } from '@angular/router';
import { ElectionService } from 'src/app/services/election.service';
import {FormBuilder, FormGroup, Validators, FormArray, SelectMultipleControlValueAccessor} from '@angular/forms';
import { Observable } from 'rxjs';
import { EncryptedVote } from 'src/app/models/encryptedVote';
import unescapeJs from 'unescape-js';
import { MatStepper } from '@angular/material';
import { sortObj } from 'sort-object';
import { Election } from 'src/app/models/election.model';

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

  getElection() {
    const results: Observable<any> = this.electionService.getElection(this.shortName);
    results.subscribe( res => {
       this.election = new Election(res);
       this.questions = this.election.questions;
       this.pk = this.election.publicKey;
       this.election.generateHash();
       console.log(this.election);
    });
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

      console.log(element.individual_proofs)

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
    return JSON.stringify({
      answers: encryptedBooth.encrypted_answers,
      election_hash: encryptedBooth.election_hash,
      election_uuid: encryptedBooth.election_uuid
    });
  }


}
