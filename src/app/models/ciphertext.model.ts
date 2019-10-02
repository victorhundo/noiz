import * as bigInt from 'big-integer';
import * as sha256 from 'sha256';
import {Proof} from 'src/app/models/proof.model';
import {Random} from 'src/app/models/random.model';
import {DisjunctiveProof} from 'src/app/models/disjunctiveProof.model';

export class Ciphertext {
  alpha:any;
  beta:any;
  pk: any;

  constructor(alpha:any, beta:any, pk:any) {
    this.alpha = alpha;
    this.beta = beta;
    this.pk = pk;
  }

  simulateProof(plaintext:any, challenge:any) {
    // compute beta/plaintext, the completion of the DH tuple
    var beta_over_plaintext = this.beta.multiply(plaintext.m.modInv(this.pk.p)).mod(this.pk.p);

    // the DH tuple we are simulating here is
    // g, y, alpha, beta/m
    return Proof.simulate(this.pk.g, this.pk.y, this.alpha, beta_over_plaintext, this.pk.p, this.pk.q, challenge);
  }

  generateProof(plaintext:any, randomness:any, challenge_generator:any){
    var proof = Proof.generate(this.pk.g, this.pk.y, randomness, this.pk.p, this.pk.q, challenge_generator);
    return proof;
  }

  disjunctive_challenge_generator(commitments:any) {
    var strings_to_hash = [];

    // go through all proofs and append the commitments
    commitments.forEach(function(commitment) {
      // toJSONObject instead of toString because of IE weirdness.
      strings_to_hash[strings_to_hash.length] = commitment.A.toJSON();
      strings_to_hash[strings_to_hash.length] = commitment.B.toJSON();
    });

    // console.log(strings_to_hash);
    // STRINGS = strings_to_hash;
    return bigInt(sha256(strings_to_hash.join(",")), 16);
  };

  generateDisjunctiveProof(list_of_plaintexts:any, real_index:any, randomness:any) {
    var proofs = list_of_plaintexts.map((plaintext:any, p_num:any) => {
      if (p_num == real_index) {
        // no real proof yet
        return {};
      } else {
        // simulate!
        return this.simulateProof(plaintext,null);
      }
    });

    // do the real proof
    var real_proof = this.generateProof(list_of_plaintexts[real_index], randomness, (commitment) => {
      // now we generate the challenge for the real proof by first determining
      // the challenge for the whole disjunctive proof.

      // set up the partial real proof so we're ready to get the hash;
      proofs[real_index] = {'commitment' : commitment};

      // get the commitments in a list and generate the whole disjunctive challenge
      var commitments = proofs.map(function(proof) {
        return proof.commitment;
      });

      var disjunctive_challenge = this.disjunctive_challenge_generator(commitments);

      // now we must subtract all of the other challenges from this challenge.
      var real_challenge = disjunctive_challenge;
      proofs.forEach(function(proof, proof_num) {
        if (proof_num != real_index)
          real_challenge = real_challenge.add(proof.challenge.negate());
      });

      // make sure we mod q, the exponent modulus
      return real_challenge.mod(this.pk.q);
    });

    // set the real proof
    proofs[real_index] = real_proof;
    return new DisjunctiveProof(proofs);
  }
}
