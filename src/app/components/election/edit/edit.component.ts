import { Component, OnInit } from '@angular/core';
import { ElectionService } from 'src/app/services/election.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import unescapeJs from 'unescape-js';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-edit-election',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditElectionComponent implements OnInit {

  shortName: any;
  election: any;
  questions: any;
  isReady = false;
  electionFormGroup: FormGroup;
  initialElectionFormValue: any;
  questionFormGroup: FormGroup;
  initialQuestionFormValue: any;

  constructor(
    private formBuilder: FormBuilder,
    private electionService: ElectionService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.shortName = this.route.snapshot.paramMap.get('short_name');
    this.getElection();
  }

  buildForms() {
    this.electionFormGroup = this.formBuilder.group({
      shortName: [this.election.short_name, Validators.compose([ Validators.required, Validators.pattern('^[a-zA-Z0-9_]*$')])],
      name: [this.election.name, Validators.required],
      description: [this.election.description, Validators.required],
      helpEmail: [this.election.help_email, Validators.compose([ Validators.required, Validators.email]) ],
      votingStartsAt: [this.election.voting_starts_at, Validators.required],
      votingEndsAt: [this.election.voting_ends_at, Validators.required]
    });
    this.questionFormGroup = this.formBuilder.group({
      question: [this.questions[0].question, Validators.required],
      min: 0,
      max: 1,
      answers: this.formBuilder.array([]),
      answer_urls: this.formBuilder.array([]),
      choice_type: 'approval',
      tally_type: 'homomorphic',
      result_type: 'absoluta'
    });
    this.questions[0].answers.forEach((e: any, i: number ) => {
      this.addAnswer(e, this.questions[0].answer_urls[i]);
    });
    this.initialQuestionFormValue = Object.assign({}, this.questionFormGroup.value);
    this.initialElectionFormValue = Object.assign({}, this.electionFormGroup.value);
  }


  get QuestionForm() {
    return this.electionFormGroup.get('questions') as FormArray;
  }

  get answersForm() {
    return this.questionFormGroup.get('answers') as FormArray;
  }

  get answersUrlForm() {
    return this.questionFormGroup.get('answer_urls') as FormArray;
  }

  minAnswer() {
    const array: FormArray = this.questionFormGroup.get('answers') as FormArray;
    return (array.length > 2);
  }

  addQuestion() {
    this.QuestionForm.push(this.questionFormGroup);
  }

  addAnswer(answerValue?: string, urlValue?: string) {

    const answer = this.formBuilder.group({
      answer: [answerValue, Validators.required],
    });

    const answerUrls = this.formBuilder.group({
      answer_urls: [urlValue, Validators.required],
    });

    this.answersForm.push(answer);
    this.answersUrlForm.push(answerUrls);
  }

  deleteAnswer(i: any) {
    this.answersForm.removeAt(i);
    this.answersUrlForm.removeAt(i);
  }

  getUpdatedFields(formName: any, formInitial: any) {
    const currentFormValue = formName.value;
    return Object.keys(currentFormValue).filter((key) => currentFormValue[key] !=  formInitial[key]);
  }

  updateElection() {
    const fieldsChanged = this.getUpdatedFields(this.electionFormGroup, this.initialElectionFormValue);
    const updateRequests: any = [];
    fieldsChanged.forEach((f: string) => {
      const data = { field: f, value: this.electionFormGroup.get(f).value };
      updateRequests.push(this.electionService.updateElection(this.election.uuid, data));
    });

    forkJoin(updateRequests).subscribe(results => {
      console.log(results);
    });
  }

  updateQuestion() {
    const fieldsChanged = this.getUpdatedFields(this.questionFormGroup, this.initialQuestionFormValue);
    if (fieldsChanged.length > 0) {
      const questions = Object.assign({}, this.questionFormGroup.value);
      const answers: any = [];
      const answersUrl: any = [];
      questions.answers.forEach((e: any) => {
        answers.push(e.answer);
      });
      questions.answer_urls.forEach((e: any) => {
        answersUrl.push(e.answer_urls);
      });
      questions.answers = answers;
      questions.answer_urls = answersUrl;
      const data = { field: 'questions', value: [questions] };
      this.electionService.updateElection(this.election.uuid, data).subscribe((res: any) => {
        console.log(res);
      });
    }
  }

  private getQuestions(c: any) {
    const questions: any = [];
    c.forEach(q => {
      const answerUrls: any = [];
      const theAnswers: any = [];

      q.answer_urls.forEach(e => {
        answerUrls.push(e);
      });

      q.answers.forEach(e => {
        theAnswers.push(e);
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


  toUnicode(s: string) {
    return s.replace(/[\u007F-\uFFFF]/g, (chr) => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
    });
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

  getElection() {
    const results: Observable<any> = this.electionService.getElection(this.shortName);
    results.subscribe( res => {
       this.election = res;
       this.election.voting_ends_at = this.dateTimeFormat(res.voting_ends_at);
       this.election.voting_starts_at = this.dateTimeFormat(res.voting_starts_at);
       const key = JSON.parse(res.public_key);
       this.election.questions = this.normalizeUnicode(this.election.questions);
       this.questions = this.getQuestions(this.election.questions);
       this.buildForms();
       this.isReady = true;
    });
  }

}
