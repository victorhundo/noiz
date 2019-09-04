import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ElectionService } from 'src/app/services/election.service';


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
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }


  createElection() {
    var results: Observable<any> = this.electionService.createElection(this.firstFormGroup.value);
    results.subscribe( res => {
      console.log(res);
    })
  }

}
