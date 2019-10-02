import * as sjcl from 'sjcl';
import * as bigInt from 'big-integer';

export class Random {
  constructor(){ }

  static getRandomInteger(max:any) {
    var bit_length = max.bitLength();
    var random = sjcl.random.randomWords(Math.ceil(bit_length / 32)+2, 0); //sjcl
    var rand_bi = bigInt(sjcl.codec.hex.fromBits(random),16); //sjcl
    return rand_bi;
  }
}
