import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,ParamMap } from '@angular/router';
import { ElectionService } from 'src/app/services/election.service';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import * as sha256 from 'sha256';


@Component({
  selector: 'app-booth',
  templateUrl: './booth.component.html',
  styleUrls: ['./booth.component.scss']
})
export class BoothComponent implements OnInit {
  short_name: string;
  election: any;
  questions: any;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor( private _formBuilder: FormBuilder, private electionService: ElectionService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.short_name = this.route.snapshot.paramMap.get('short_name');
    this.getElection('short_name')
    this.firstFormGroup = this._formBuilder.group({
      answer: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  private normalizeUnicode(a:string) {
    return a.replace(/u'/g,'\'').replace(/'/g,'"');
  }

  getElection(){
    var results: Observable<any> = this.electionService.getElection(this.short_name);
    results.subscribe( res => {
       this.election = res;
       var a = this.election.questions;
       this.questions = JSON.parse(this.normalizeUnicode(this.election.questions))[0];
       console.log(btoa(sha256(JSON.stringify(this.election))))
    })
  }

  getAnswer(){
    return this.firstFormGroup.get('answer').value;
  }

  submit() {
    var encrypt = { "encrypted_vote" : this.getAnswer() }
    var results: Observable<any> = this.electionService.voteElection(this.election.uuid, encrypt);
    results.subscribe( res => {
       console.log(res);
        this.router.navigate([''])
    })
  }



}
