import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { ElectionService } from 'src/app/services/election.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-eletction',
  templateUrl: './eletction.component.html',
  styleUrls: ['./eletction.component.scss']
})
export class EletctionComponent implements OnInit {
  isLinear = false;
  electionFormGroup: FormGroup;
  questionFormGroup: FormGroup;
  trusteeFormGroup: FormGroup;
  voterFormGroup: FormGroup;
  trusteeOption: number;
  hideRequired: boolean = true;

  constructor(private _formBuilder: FormBuilder, private electionService: ElectionService) { }

  ngOnInit() {
    this.trusteeOption = 1;
    this.electionFormGroup = this._formBuilder.group({
      short_name: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      help_email: ['', Validators.required],
      voting_starts_at: ['', Validators.required],
      voting_ends_at: ['', Validators.required],
      use_voter_aliases: false,
      use_advanced_audit_features: false,
      randomize_answer_order: false,
      private_p: false,
      questions: this._formBuilder.array([])
    });
    this.questionFormGroup = this._formBuilder.group({
      question: ['', Validators.required],
      min: 0,
      max: 1,
      answers: this._formBuilder.array([]),
      answer_urls: this._formBuilder.array([]),
      choice_type: "approval",
      tally_type: "homomorphic",
      result_type: "absoluta"
    });
    this.addAnswer();
    this.QuestionForm.push(this.questionFormGroup)
    this.trusteeFormGroup = this._formBuilder.group({
      name: [{value: 'Sistema de Votação Eletrônica', disabled: true}, Validators.required],
      email: [{value: 'heliosvoting.pt@gmail.com',  disabled: true}, Validators.required],
      trustee: ['helios',Validators.required]
    });
    this.voterFormGroup = this._formBuilder.group({
      loadVoter: [{value: 'carregar arquivo de eleitores', disabled: true}, Validators.required],
      voter: ['open',Validators.required]
    });
  }


  createElection() {
    var results: Observable<any> = this.electionService.createElection(this.electionFormGroup.value);
    results.subscribe( res => {
      console.log(res);
    })
  }

  get QuestionForm(){
    return this.electionFormGroup.get('questions') as FormArray
  }

  get answersForm(){
    return this.questionFormGroup.get('answers') as FormArray
  }

  get answersUrlForm(){
    return this.questionFormGroup.get('answer_urls') as FormArray
  }

  addQuestion() {
    this.QuestionForm.push(this.questionFormGroup)
  }

  addAnswer() {
    const answer = this._formBuilder.group({
      answer: ['', Validators.required],
    })

    const answer_urls = this._formBuilder.group({
      answer_urls: ['', Validators.required],
    })

    this.answersForm.push(answer)
    this.answersUrlForm.push(answer_urls)
  }

  deleteAnswer(i){
    this.answersForm.removeAt(i);
    this.answersUrlForm.removeAt(i);
  }

  trusteeHelios(){
    this.trusteeFormGroup.controls['name'].disable();
    this.trusteeFormGroup.controls['email'].disable();
  }

  trusteeOther(){
    this.trusteeFormGroup.controls['name'].enable();
    this.trusteeFormGroup.controls['email'].enable();
  }

  voterOpen(){
    this.voterFormGroup.controls['loadVoter'].disable();
  }

  voterClose(){
    this.voterFormGroup.controls['loadVoter'].enable();
  }

  submit() {
    var resultsElection: Observable<any> = this.electionService.createElection(this.electionFormGroup.value);
    resultsElection.subscribe( res => {
      if (this.trusteeFormGroup.controls['trustee'].value == 'helios'){
        var resultsElection: Observable<any> = this.electionService.addHelioTrustee(res.message.uuid, this.trusteeFormGroup.value);
        resultsElection.subscribe( res => {
          console.log(res)
        })
      } else {
        console.log(this.trusteeFormGroup.controls['trustee'].value);
      }

      if(this.voterFormGroup.controls['voter'].value == 'open'){
        var resultsElection: Observable<any> = this.electionService.eligibility(res.message.uuid, {"eligibility":"openreg"});
        resultsElection.subscribe( res => {
          console.log(res)
        })
      } else {
        var resultsElection: Observable<any> = this.electionService.eligibility(res.message.uuid, {"eligibility":"closereg"});
        resultsElection.subscribe( res => {
          console.log(res)
        })
      }


    })
  }

}
