import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-part1',
  templateUrl: './form-part1.component.html',
  styleUrls: ['./form-part1.component.scss']
})
export class FormPart1Component implements OnInit {

  electionFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
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
      private_p: false,
      questions: this.formBuilder.array([])
    });
  }

}
