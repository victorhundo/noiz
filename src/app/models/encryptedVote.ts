import { EncryptedAnswer } from './encryptedAnswer';
import { Util } from './util';
import { ElGamal } from './elGamal';

export class EncryptedVote {
  election:any
  election_hash:any;
  election_uuid:any;
  encrypted_answers:any = [];

    constructor(answers:any, election:any){ 
        if (election == null)
            return;
        
        this.election = election;
        this.election_hash = election.hash;
        this.election_uuid = election.uuid;

        if (answers == null)
            return;

        var n_questions:number = election.questions.length;
        this.encrypted_answers = [];

         // loop through questions
        for (var i=0; i<n_questions; i++) {
            this.encrypted_answers[i] = new EncryptedAnswer(election.questions[i], answers[i], election.publicKey);
        }
    }
    
    static fromJSONObject(encryptedAnswers: any, election: any) {
      if (encryptedAnswers == null) { return null; }

      const ev = new EncryptedVote(null, election);

      ev.encrypted_answers = encryptedAnswers.answers.map((ea: any) => {
        return EncryptedAnswer.fromJSONObject(ea, election);
      });

      ev.election_hash = encryptedAnswers.election_hash;
      ev.election_uuid = encryptedAnswers.election_uuid;

      return ev;
    }

    public verifyProof(pk: any, outcomeCallback: any) {
        const zeroOrOne: any = Util.generate_plaintexts(pk, 0, 1);
        let VALID_P = true;

        this.encrypted_answers.forEach((encEnswer: any, eaNum: number) => {
          let overallResult = 1;
          const max = this.election.questions[eaNum].max;

          encEnswer.choices.forEach((choice: any, choiceNum: any) => {
            const result = choice.verifyDisjunctiveProof(
              zeroOrOne,
              encEnswer.individual_proofs[choiceNum],
              ElGamal.disjunctive_challenge_generator
              );

            outcomeCallback(eaNum, choiceNum, result, choice);

            VALID_P = VALID_P && result;
            if ( !(max === null) ) { overallResult = choice.multiply(overallResult); }
          });
        });
    }

}