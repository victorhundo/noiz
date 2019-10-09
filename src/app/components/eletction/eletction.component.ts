import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl, ControlContainer} from '@angular/forms';
import { ElectionService } from 'src/app/services/election.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { MatStepper } from '@angular/material';

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
  hideRequired = true;
  fileDisable = false;
  uploadFileForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private electionService: ElectionService,
    private router: Router,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.uploadFileForm = new FormGroup({
      theFile: new FormControl(null, Validators.required)
    });
    this.trusteeOption = 1;
    this.electionFormGroup = this.formBuilder.group({
      short_name: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      help_email: ['', Validators.required],
      voting_starts_at: ['', Validators.required],
      voting_ends_at: ['', Validators.required],
      use_voter_aliases: false,
      use_advanced_audit_features: false,
      randomize_answer_order: false,
      private_p: false
    });
    this.questionFormGroup = this.formBuilder.group({
      question: ['', Validators.required],
      min: 0,
      max: 1,
      answers: this.formBuilder.array([]),
      answer_urls: this.formBuilder.array([]),
      choice_type: 'approval',
      tally_type: 'homomorphic',
      result_type: 'absoluta'
    });
    this.addAnswer();
    this.addAnswer();
    this.trusteeFormGroup = this.formBuilder.group({
      name: [{value: 'Sistema de Votação Eletrônica', disabled: true}, Validators.required],
      email: [{value: 'heliosvoting.pt@gmail.com',  disabled: true}, Validators.required],
      trustee: ['helios', Validators.required]
    });
    this.voterFormGroup = this.formBuilder.group({
      loadVoter: [{value: 'carregar arquivo de eleitores', disabled: true}, Validators.required],
      voter: ['open', Validators.required],
      theFile: [null, Validators.required]
    });
  }

  goForward(stepper: MatStepper, isDisable?: boolean) {
    if (!isDisable) { stepper.next(); }
  }

  goBack(stepper: MatStepper, isDisable?: boolean) {
    if (!isDisable) { stepper.previous(); }
  }

  createElection() {
    const results: Observable<any> = this.electionService.createElection(this.electionFormGroup.value);
    results.subscribe( res => {
      console.log(res);
    });
  }

  enableCSV() {
    return !(this.voterFormGroup.get('voter').value === 'open');
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

  addQuestion() {
    this.QuestionForm.push(this.questionFormGroup);
  }

  addAnswer() {
    const answer = this.formBuilder.group({
      answer: ['', Validators.required],
    });

    const answerUrls = this.formBuilder.group({
      answer_urls: ['', Validators.required],
    });

    this.answersForm.push(answer);
    this.answersUrlForm.push(answerUrls);
  }

  deleteAnswer(i: any) {
    this.answersForm.removeAt(i);
    this.answersUrlForm.removeAt(i);
  }

  trusteeHelios() {
    this.trusteeFormGroup.get('name').disable();
    this.trusteeFormGroup.get('email').disable();
  }

  trusteeOther() {
    this.trusteeFormGroup.get('name').enable();
    this.trusteeFormGroup.get('email').enable();
  }

  voterPrivate() {
    this.fileDisable = !this.fileDisable;
  }

  fileIsReady() {
    return this.fileDisable;
  }

  voterOpen() {
    this.voterFormGroup.get('loadVoter').disable();
    this.fileDisable = false;
  }

  voterClose() {
    this.voterFormGroup.get('loadVoter').enable();
    this.fileDisable = true;
  }

  minAnswer() {
    const array: FormArray = this.questionFormGroup.get('answers') as FormArray;
    return (array.length > 2);
  }

  submit() {
    this.electionFormGroup.addControl('questions', this.formBuilder.array([]));
    this.QuestionForm.push(this.questionFormGroup);
    const resultsElection: Observable<any> = this.electionService.createElection(this.electionFormGroup.value);
    resultsElection.subscribe( res => {
      const trusteeRequest: Observable<any> = this.trusteeRequest(res.message.uuid, this.trusteeFormGroup.get('trustee').value);
      const voterRequest: Observable<any> = this.voterRequest(res.message.uuid, this.voterFormGroup.get('voter').value);
      const createVoters: Observable<any> = this.createVoterRequest(res.message.uuid, this.voterFormGroup.get('voter').value);
      forkJoin(trusteeRequest, voterRequest, createVoters).subscribe(results => {
        let test = { sucess:  true, msg: 'sucesso' };
        results.forEach(e => {
          if (!(e.status === 201)) { test = { sucess:  false, msg: e.message }; }
        });
        if (test.sucess) {
          this.router.navigate(['']);
        } else {
          console.log(test);
        }
      });
    });
  }

  trusteeRequest(uuid: string, type: string) {
    if (type === 'helios') {
      return this.electionService.addHelioTrustee(uuid, this.trusteeFormGroup.value);
    } else {
      return this.electionService.addHelioTrustee(uuid, this.trusteeFormGroup.value); // TODO
    }
  }

  voterRequest(uuid: string, type: string) {
    if (type === 'open') {
      return this.electionService.eligibility(uuid, {eligibility: 'openreg'});
    } else {
      return this.electionService.eligibility(uuid, {eligibility: 'closereg'});
    }
  }

  createVoterRequest(uuid: string, type: string){
    if (type === 'open') {
      return of<any>({status: 201}); // Empty Observable: if election is open do not need this
    } else {
      const formData: any = new FormData();
      formData.append('voters_file', this.uploadFileForm.get('theFile').value);
      return this.electionService.addVoters(uuid, formData);
    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadFileForm.get('theFile').setValue(file);
      this.fileDisable = false;
    }
  }
}
