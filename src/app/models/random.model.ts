import * as sjcl from 'sjcl';
declare var BigInt:any;

export class Random {
  constructor(){ }

  static getRandomInteger(max:any) {
    var bit_length = max.bitLength();
    var random = sjcl.random.randomWords(Math.ceil(bit_length / 32)+2, 0); //sjcl
    var rand_bi = new BigInt(sjcl.codec.hex.fromBits(random),16); //sjcl
    return rand_bi.mod(max);
  }
}
