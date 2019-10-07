import {ElGamal} from 'src/app/models/elGamal';
import { Util } from './util';
import { Random } from './random.model';
import {Ciphertext} from './ciphertext.model';
declare var BigInt:any;

export class EncryptedAnswer {
    choices: any;
    randomness:any;
    individual_proofs:any;
    overall_proof:any;
    answer:any;

    constructor(question:any, answer:any, pk:any) {
        // if nothing in the constructor
        if (question == null)
          return;
    
        // store answer
        // CHANGE 2008-08-06: answer is now an *array* of answers, not just a single integer
        this.answer = answer;
     
        // do the encryption
        var enc_result = this.doEncryption(question, answer, pk, null);
    
        this.choices = enc_result.choices;
        this.randomness = enc_result.randomness;
        this.individual_proofs = enc_result.individual_proofs;
        this.overall_proof = enc_result.overall_proof;
      }

      doEncryption(question:any, answer:any, pk:any, randomness:any) {
        var choices: any = [];
        var individual_proofs: any = [];
        var overall_proof: any = null;
        var generate_new_randomness: boolean = false;
        var num_selected_answers:number = 0;
        var plaintexts: any;

        var plaintexts: any = null;
        if (question.max != null){
          plaintexts = Util.generate_plaintexts(pk,question.min,question.max);
        }
        var zero_one_plaintexts = Util.generate_plaintexts(pk, 0, 1);
    
        if(!randomness){
          randomness = [];
          generate_new_randomness = true;
        }
    
        for(let i = 0; i < question.answers.length; i++){
          var index:number;
          var plaintext_index:number;
          if (answer.includes(i)) {
            plaintext_index = 1;
            num_selected_answers += 1;
          } else {
            plaintext_index = 0;
          }
    
          if (generate_new_randomness){
            randomness[i] = Random.getRandomInteger(pk.q);
          }
          
          choices[i] = ElGamal.encrypt(pk, zero_one_plaintexts[plaintext_index], randomness[i]);
    
          if (generate_new_randomness) {
            individual_proofs[i] = choices[i].generateDisjunctiveProof(zero_one_plaintexts, plaintext_index, randomness[i], ElGamal.disjunctive_challenge_generator);
          }
        }
    
        if (generate_new_randomness && question.max != null) {
          var hom_sum = choices[0];
          var rand_sum = randomness[0];
          for (var i=1; i<question.answers.length; i++) {
            hom_sum = hom_sum.multiply(choices[i]);
            rand_sum = rand_sum.add(randomness[i]).mod(pk.q);
          }
    
          var overall_plaintext_index = num_selected_answers;
          if (question.min)
            overall_plaintext_index -= question.min;
    
          overall_proof = hom_sum.generateDisjunctiveProof(plaintexts, overall_plaintext_index, rand_sum, ElGamal.disjunctive_challenge_generator);
        }
    
       return {
          'choices' : choices,
          'randomness' : randomness,
          'individual_proofs' : individual_proofs,
          'overall_proof' : overall_proof
        };
      }

    static fromJSONObject(encrypted_answer:any, election:any, ){
        var ea = new EncryptedAnswer(null,null,null);

        ea.choices = encrypted_answer.choices.map((choice:any) => {
          return Ciphertext.fromJSONObject(choice, election.public_key);
        });
        
        ea.individual_proofs = encrypted_answer.individual_proofs.map((p:any) => {
          return ElGamal.disjunctiveProofFromJSONObject(p);
        });
        
        ea.overall_proof = ElGamal.disjunctiveProofFromJSONObject(encrypted_answer.overall_proof);
        
        // possibly load randomness and plaintext
        if (encrypted_answer.randomness) {
          ea.randomness = encrypted_answer.randomness.map((r) =>{
            return BigInt.fromJSONObject(r);
          });
          ea.answer = encrypted_answer.answer;
        }

        return ea;
    }
}