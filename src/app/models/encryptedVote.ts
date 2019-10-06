import { EncryptedAnswer } from './encryptedAnswer';

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

        console.log(election)
        var n_questions:number = election.questions.length;
        this.encrypted_answers = [];

         // loop through questions
        for (var i=0; i<n_questions; i++) {
            this.encrypted_answers[i] = new EncryptedAnswer(election.questions[i], answers[i], election.public_key);
        }
    }
}