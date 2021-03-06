import {Proof} from 'src/app/models/proof.model';
import {DisjunctiveProof} from 'src/app/models/disjunctiveProof.model';
declare var hex_sha1:any;
declare var BigInt:any;

export class Ciphertext {

  alpha:any;
  beta:any;
  pk: any;

  constructor(alpha:any, beta:any, pk:any) {
    this.alpha = alpha;
    this.beta = beta;
    this.pk = pk;
  } 

  static fromJSONObject(d: any,  pk: any) {
    return new Ciphertext( new BigInt(d.alpha, 10), new BigInt(d.beta, 10), pk);
  }

  public toString = () : string => {
    return JSON.stringify({
      'alpha': this.alpha.toString(),
      'beta': this.beta.toString(),
    })
  }

  public toJSONObject() {
    return {alpha: this.alpha.toString(), beta: this.beta.toString()}
  }

  multiply(other:any) {
    // special case if other is 1 to enable easy aggregate ops
    if (other == 1)
      return this;
    
    // homomorphic multiply
    return new Ciphertext(
      this.alpha.multiply(other.alpha).mod(this.pk.p),
      this.beta.multiply(other.beta).mod(this.pk.p),
      this.pk);
  }

  generateProof(plaintext:any, randomness:any, challenge_generator:any){
    var proof = Proof.generate(this.pk.g, this.pk.y, randomness, this.pk.p, this.pk.q, challenge_generator);
    return proof;
  }

  simulateProof(plaintext:any, challenge:any) {
    // compute beta/plaintext, the completion of the DH tuple
    var beta_over_plaintext = this.beta.multiply(plaintext.m.modInverse(this.pk.p)).mod(this.pk.p);

    // the DH tuple we are simulating here is
    // g, y, alpha, beta/m
    return Proof.simulate(this.pk.g, this.pk.y, this.alpha, beta_over_plaintext, this.pk.p, this.pk.q, challenge);
  }

  generateDisjunctiveProof(list_of_plaintexts:any, real_index:any, randomness:any, challenge_generator:any) {
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

      var disjunctive_challenge = challenge_generator(commitments);

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
    var val: any = new DisjunctiveProof(proofs);
    return val;
  }

  verifyDisjunctiveProof(listOfPlaintexts: any, disjProof: any, challengeGenerator: any) {
    // let result = true;
    // console.log(disjProof.proof)
    const proofs = disjProof.proofs;

    // for loop because we want to bail out of the inner loop
    // if we fail one of the verifications.
    for (let i = 0; i < listOfPlaintexts.length; i++) {
      if (!this.verifyProof(listOfPlaintexts[i], proofs[i])) {
        return false;
      }
    }

    // check the overall challenge

    // first the one expected from the proofs
    
    const commitments = proofs.map((proof: any) => proof.commitment);
    const expectedChallenge = challengeGenerator(commitments);

    // then the one that is the sum of the previous one.
    let sum = new BigInt('0', 10);
    proofs.forEach((proof: any) => { sum = sum.add(proof.challenge).mod(this.pk.q); });

    return expectedChallenge.equals(sum);
  }

  verifyProof(plaintext: any , proof: any, challengeGenerator?: any) {
    // DH tuple to verify is
    // g, y, alpha, beta/m
    const betaOverM = this.beta.multiply(plaintext.m.modInverse(this.pk.p)).mod(this.pk.p);

    return proof.verify(
      this.pk.g,
      this.pk.y,
      this.alpha,
      betaOverM,
      this.pk.p,
      this.pk.q,
      challengeGenerator
    );
  }


}
