declare var BigInt:any;

export class Plaintext {
  pk:number; m:any

  constructor(m:any, pk:any, encode_m:any) {
    this.pk = pk;
    if(encode_m){
      var y = m.add(BigInt.ONE);
      var test = y.modPow(pk.q,pk.p);
      if (test.equals(BigInt.ONE)){
        this.m = y;
      } else {
        this.m = y.negate().mod(pk.p);
      }
    } else{
      this.m = m;
    }
  }
}
