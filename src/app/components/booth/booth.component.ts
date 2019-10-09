import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,ParamMap } from '@angular/router';
import { ElectionService } from 'src/app/services/election.service';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable } from 'rxjs';
import { EncryptedVote } from 'src/app/models/encryptedVote';
import unescapeJs from 'unescape-js';
declare var b64_sha256:any;
declare var BigInt:any; 

@Component({
  selector: 'app-booth',
  templateUrl: './booth.component.html',
  styleUrls: ['./booth.component.scss'] 
})
export class BoothComponent implements OnInit {
  short_name: string;
  election: any = {};
  questions: any = [];
  eg: any;
  pk: any = {};
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor( private _formBuilder: FormBuilder, private electionService: ElectionService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.short_name = this.route.snapshot.paramMap.get('short_name');
    this.getElection()
    this.firstFormGroup = this._formBuilder.group({
      answer: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  private normalizeUnicode(a:string) {
    a = unescapeJs(a);
    a = a.replace(/u'/g,'\'').replace(/'/g,'"');
    var result:any = []
    JSON.parse(decodeURIComponent(a)).forEach(e => {
      result.push({
        "answer_urls":e.answer_urls,
        "answers": e.answers,
        "choice_type": e.choice_type,
        "max": e.max,
        "min": e.min,
        "question": e.question,
        "result_type": e.result_type,
        "tally_type": e.tally_type
      })
    });
    return result
  }

  private getQuestions(c:any){
    var questions:any = []
    c.forEach(q => {
      var answer_urls:any = []
      var answers:any = []
 
      q.answer_urls.forEach(e => {
        answer_urls.push(e.answer_urls)
      });
  
      q.answers.forEach(e => {
        answers.push(e.answer)
      });
  
      questions.push( {
        "answer_urls":answer_urls,
          "answers": answers,
          "choice_type": q.choice_type,
          "max": q.max,
          "min": q.min,
          "question": q.question,
          "result_type": q.result_type,
          "tally_type": q.tally_type
      })      
    });
    return questions;
  }

  private dateTimeFormat(a:string){
    a = a.replace('.000000','')
    return a.slice(0,(a.length-2)) + ':' + a.slice(-2);
  }

  getElection(){
    var results: Observable<any> = this.electionService.getElection(this.short_name);
    results.subscribe( res => {
       this.election = res;
       this.election.frozen_at = this.dateTimeFormat(res.frozen_at);
       this.election.voting_ends_at = this.dateTimeFormat(res.voting_ends_at); 
       this.election.voting_starts_at = this.dateTimeFormat(res.voting_starts_at);
       var key = JSON.parse(res.public_key);
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
    })
  }

  toUnicode(s:string) {
    return s.replace(/[\u007F-\uFFFF]/g, (chr) => {
      return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    })
  }

  keyBigInt(s:any){
    return {
      "g": new BigInt(s.g),
      "p": new BigInt(s.p),
      "q": new BigInt(s.q),
      "y": new BigInt(s.y),
    } 
  }

  getAnswer(){
    return parseInt(this.firstFormGroup.get('answer').value);
  }

  submit() { 
    var data:string = this.encrypted_vote();
    console.log(data);
    var results: Observable<any> = this.electionService.voteElection(this.election.uuid, data);
    results.subscribe( res => {
        if(res.status == 200) this.router.navigate([''])
    })  
  }

  encrypted_vote() {
    var encryptedBooth = new EncryptedVote([[this.getAnswer()]],this.election); 
    delete encryptedBooth.election;
    encryptedBooth.encrypted_answers.forEach(element => {
      delete element.answer;
      delete element.randomness;
      element.choices.forEach(c => {
        c.alpha = c.alpha.toString(),
        c.beta = c.beta.toString()
        delete c.pk;
      });
      element.individual_proofs.forEach(c => {
        c.forEach(p => {
          p.challenge = p.challenge.toString(),
          p.commitment.A = p.commitment.A.toString(),
          p.commitment.B = p.commitment.B.toString(),
          p.response = p.response.toString()
        })
      });
      element.overall_proof.forEach(p => {
        p.challenge = p.challenge.toString(),
          p.commitment.A = p.commitment.A.toString(),
          p.commitment.B = p.commitment.B.toString(),
          p.response = p.response.toString()
      });
    });
    return JSON.stringify({
      "answers": encryptedBooth["encrypted_answers"],
      "election_hash": encryptedBooth["election_hash"],
      "election_uuid": encryptedBooth["election_uuid"]
    })
  }
}