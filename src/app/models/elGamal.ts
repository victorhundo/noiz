import {Random} from 'src/app/models/random.model';
import {Ciphertext} from 'src/app/models/ciphertext.model';
import { DisjunctiveProof } from './disjunctiveProof.model';
import { Proof } from './proof.model';
declare var hex_sha1:any;
declare var BigInt:any;

export class ElGamal {
    constructor(){ }
  
    static disjunctive_challenge_generator(commitments:any) {
        var strings_to_hash = [];
    
        // go through all proofs and append the commitments
        commitments.forEach(function(commitment) {
          // toJSONObject instead of toString because of IE weirdness.
          strings_to_hash[strings_to_hash.length] = commitment.A.toString();
          strings_to_hash[strings_to_hash.length] = commitment.B.toString();
        });
    
        // console.log(strings_to_hash);
        // STRINGS = strings_to_hash;
        return new BigInt(hex_sha1(strings_to_hash.join(",")), 16);
    };
    
    static encrypt(pk, plaintext,r){
        if (plaintext.m.equals(BigInt.ZERO)){
          console.error("Can't encrypt 0 with El Gamal");
          return undefined;
        }
    
        if (!r) r = Random.getRandomInteger(pk.q);
    
        var alpha = pk.g.modPow(r, pk.p);
        var beta = (pk.y.modPow(r, pk.p)).multiply(plaintext.m).mod(pk.p);
    
        return new Ciphertext(alpha, beta, pk);
      }

    static disjunctiveProofFromJSONObject(d:any){
      if (d === null) { return null; }

      return new DisjunctiveProof(d.map((p: any) => {
        return Proof.fromJSONObject(p);
      }));
    }

    static disjunctiveProof = function(d:any) {
      if (d==null)
        return null;
        
      return new DisjunctiveProof(
        d.map((p:any) => {
          return new Proof(
            new BigInt(p.commitment.A, 10),
            new BigInt(p.commitment.B, 10),
            new BigInt(p.challenge, 10),
            new BigInt(p.response, 10)
          );
        })
      );
    };
    
  }
  