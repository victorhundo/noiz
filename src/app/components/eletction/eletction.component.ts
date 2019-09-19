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
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  hideRequired: boolean = true;

  constructor(private _formBuilder: FormBuilder, private electionService: ElectionService) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
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
    this.secondFormGroup = this._formBuilder.group({
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
    this.QuestionForm.push(this.secondFormGroup)
  }


  createElection() {
    var results: Observable<any> = this.electionService.createElection(this.firstFormGroup.value);
    results.subscribe( res => {
      console.log(res);
    })
  }

  get QuestionForm(){
    return this.firstFormGroup.get('questions') as FormArray
  }

  get answersForm(){
    return this.secondFormGroup.get('answers') as FormArray
  }

  get answersUrlForm(){
    return this.secondFormGroup.get('answer_urls') as FormArray
  }

  addQuestion() {
    this.QuestionForm.push(this.secondFormGroup)
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


}
