import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute,ParamMap } from '@angular/router';
import { ElectionService } from 'src/app/services/election.service';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {Plaintext} from 'src/app/models/plaintext.model';
import {Ciphertext} from 'src/app/models/ciphertext.model';
import { Observable } from 'rxjs';
import * as sha256 from 'sha256';
import * as bigInt from 'big-integer';
import * as sjcl from 'sjcl';


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
    return a.replace(/u'/g,'\'').replace(/'/g,'"');
  }

  getElection(){
    var results: Observable<any> = this.electionService.getElection(this.short_name);
    results.subscribe( res => {
       this.election = res;
       var a = this.election.questions;
       var key = JSON.parse(res.public_key);
       this.questions = JSON.parse(this.normalizeUnicode(this.election.questions))[0];
       this.pk.g = bigInt(key.g);
       this.pk.p = bigInt(key.p);
       this.pk.q = bigInt(key.q);
       this.pk.y = bigInt(key.y);
    })
  }

  getAnswer(){
    return this.firstFormGroup.get('answer').value;
  }

  submit() {
    var encrypt = { "encrypted_vote" : this.getAnswer() }
    var vote_encrypted = this.doEncryption(this.questions, this.getAnswer(), this.pk)
    console.log(vote_encrypted);
    console.log(vote_encrypted.choices[0].alpha.toString());
    // var results: Observable<any> = this.electionService.voteElection(this.election.uuid, encrypt);
    // results.subscribe( res => {
    //    console.log(res);
    //     this.router.navigate([''])
    // })
  }

  generate_plaintexts(pk,min,max){
    var last_plaintext: any = bigInt.one;
    var plaintexts:any = [];

    if(min == null) min = 0;

    for(var i=0; i <=max;i++){
      if(i >= min){
        var plainText:Plaintext = new Plaintext(last_plaintext, pk, false);
        plaintexts.push(plainText);
      }
      last_plaintext = last_plaintext.multiply(pk.g).mod(pk.p);
    }
    return plaintexts;
  }

  getRandomInteger(max:any) {
    var bit_length = max.bitLength();
    var random = sjcl.random.randomWords(Math.ceil(bit_length / 32)+2, 0); //sjcl
    var rand_bi = bigInt(sjcl.codec.hex.fromBits(random),16); //sjcl
    return rand_bi;
  }

  encrypt(pk, plaintext,r){
    // if (plaintext.getM().equals(BigInt.ZERO))
    // throw "Can't encrypt 0 with El Gamal"

    if (!r){
      r = this.getRandomInteger(pk.q);
    }

    var alpha = pk.g.modPow(r, pk.p);
    var beta = (pk.y.modPow(r, pk.p)).multiply(plaintext.m).mod(pk.p);

    return new Ciphertext(alpha, beta, pk);
  }

  disjunctive_challenge_generator(commitments:any) {
    var strings_to_hash = [];

    // go through all proofs and append the commitments
    commitments.each(function(commitment) {
      // toJSONObject instead of toString because of IE weirdness.
      strings_to_hash[strings_to_hash.length] = commitment.A.toJSON();
      strings_to_hash[strings_to_hash.length] = commitment.B.toJSON();
    });

    // console.log(strings_to_hash);
    // STRINGS = strings_to_hash;
    return bigInt(sha256(strings_to_hash.join(",")), 16);
  };

  doEncryption(question:any, answer:any, pk:any) {
    var choices: any = [];
    var individual_proofs: any = [];
    var overall_proof: any = null;
    var randomness = [];
    var generate_new_randomness: boolean = true;
    var num_selected_answers:number = 0;
    var plaintexts: any;

    var plaintexts: any = this.generate_plaintexts(this.pk,question.min,question.max);
    var zero_one_plaintexts = this.generate_plaintexts(pk, 0, 1);

    for(let i = 0; i < question.answers.length; i++){
      var index:number;
      var plaintext_index:number;
      if (question.answers[i].answer == answer){
        plaintext_index = 1;
        num_selected_answers++;
      }else {
        plaintext_index = 0;
      }

      randomness[i] = this.getRandomInteger(pk.q);
      choices[i] = this.encrypt(pk, zero_one_plaintexts[plaintext_index], randomness[i]);
      individual_proofs[i] = choices[i].generateDisjunctiveProof(zero_one_plaintexts, plaintext_index, randomness[i]);
    }

    var hom_sum = choices[0];
    var rand_sum = randomness[0];
    for(var i=0; i < question.answers.lenght; i++){
      hom_sum = hom_sum.multiply(choices[i]);
      rand_sum = rand_sum.add(randomness[i]).mod(pk.q);
    }

    var overall_plaintext_index = num_selected_answers;
      if (question.min)
        overall_plaintext_index -= question.min;

   overall_proof = hom_sum.generateDisjunctiveProof(plaintexts, overall_plaintext_index, rand_sum);
   return {
      'choices' : choices,
      'randomness' : randomness,
      'individual_proofs' : individual_proofs,
      'overall_proof' : overall_proof
    };
  }


}
