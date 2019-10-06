import {Random} from 'src/app/models/random.model';
declare var BigInt:any;

export class Proof {
  A:any;
  B:any;
  commitment:any = {};
  challenge:any;
  response:any

  constructor(A:any, B:any, challenge:any, response:any){
    this.challenge = challenge;
    this.commitment.A = A;
    this.commitment.B = B;
    this.response = response;
  }

  public toString = () : string => {
    return JSON.stringify({
      "challenge": this.challenge.toString(),
      "commitment": {
        A: this.commitment.A.toString(),
        B: this.commitment.B.toString()
      },
      "response": this.response.toString()
    })
  }

  public toJSONObject() {
    return {
      "challenge": this.challenge.toString(),
      "commitment": {
        A: this.commitment.A.toString(),
        B: this.commitment.B.toString()
      },
      "response": this.response.toString()
    }
  }

  static generate(little_g, little_h, x, p, q, challenge_generator) {
    // generate random w
    var w = Random.getRandomInteger(q);

    // create a proof instance
    var proof = new Proof(null,null,null,null);

    // compute A=little_g^w, B=little_h^w
    proof.commitment.A = little_g.modPow(w, p);
    proof.commitment.B = little_h.modPow(w, p);

    // Get the challenge from the callback that generates it
    proof.challenge = challenge_generator(proof.commitment);

    var a:any = x.multiply(proof.challenge)
    // Compute response = w + x * challenge
    proof.response = w.add(x.multiply(proof.challenge)).mod(q);

    return proof;
  };

  static simulate(little_g, little_h, big_g, big_h, p, q, challenge) {
    // generate a random challenge if not provided
    if (challenge == null) {
      challenge = Random.getRandomInteger(q);
    }

    // random response, does not even need to depend on the challenge
    var response = Random.getRandomInteger(q);

    // now we compute A and B
    // A = little_g ^ w, and at verification time, g^response = G^challenge * A, so A = (G^challenge)^-1 * g^response
    var A = big_g.modPow(challenge, p).modInverse(p).multiply(little_g.modPow(response, p)).mod(p);

    // B = little_h ^ w, and at verification time, h^response = H^challenge * B, so B = (H^challenge)^-1 * h^response
    var B = big_h.modPow(challenge, p).modInverse(p).multiply(little_h.modPow(response, p)).mod(p);

    return new Proof(A, B, challenge, response);
  }

  

  static fromJSONObject = function(d:any) {
    return new Proof(
      BigInt.fromJSONObject(d.commitment.A),
      BigInt.fromJSONObject(d.commitment.B),
      BigInt.fromJSONObject(d.challenge),
      BigInt.fromJSONObject(d.response));
  };
}
