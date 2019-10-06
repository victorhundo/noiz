import {Plaintext} from 'src/app/models/plaintext.model';
declare var BigInt:any;

export class Util {
    constructor(){ }

    static generate_plaintexts(pk:any,min:any,max:any){
        var last_plaintext: any = BigInt.ONE;
        var plaintexts:any = [];
    
        if(min == null) min = 0;
    
        for(var i=0; i <=max;i++){
          if(i >= min)
            plaintexts.push(new Plaintext(last_plaintext, pk, false));
          last_plaintext = last_plaintext.multiply(pk.g).mod(pk.p);
        }
        return plaintexts;
      
    }

    static bigIntFromJSONObject(s:any){
        return BigInt(s,10);
    }
}