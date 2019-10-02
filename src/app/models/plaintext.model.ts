import * as bigInt from 'big-integer';

export class Plaintext {
  pk:number; m:any

  constructor(m:any, pk:any, encode_m:any) {
    this.pk = pk;
    if(encode_m){
      var y = m.add(bigInt.one);
      var test = y.modPow(pk.q,pk.p);
      if (test.equals(bigInt.one)){
        this.m = y;
      } else {
        this.m = y.negate().mod(pk.p);
      }
    } else{
      this.m = m;
    }
  }
}
