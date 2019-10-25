import { Util } from './util';
declare var b64_sha256: any;
declare var BigInt: any;

export class Election {
    castUrl: any;
    description: any;
    frozenAt: any;
    name: any;
    openreg: any;
    publicKey: any;
    questions: any;
    shortName: any;
    useVoterAliases: any;
    uuid: any;
    votersHash: any;
    votingEndsAt: any;
    votingStartsAt: any;
    hash: any;
    publicKeyS: any;
    helpEmail: any;
    tallyingStartedAt: any;
    tallyingFinishedAt: any;
    result: any;

    constructor(response: any) {
        this.castUrl = response.cast_url;
        this.description = response.description;
        this.frozenAt = response.frozen_at;
        this.name = response.name;
        this.openreg = response.openreg;
        this.publicKeyS = response.public_key;
        this.publicKey = this.getKeyBigInt(response.public_key);
        this.questions = response.questions;
        this.shortName = response.short_name;
        this.useVoterAliases = response.use_voter_aliases;
        this.uuid = response.uuid;
        this.votersHash = response.voters_hash;
        this.votingEndsAt = response.voting_ends_at;
        this.votingStartsAt = response.voting_starts_at;
        this.helpEmail = response.help_email;
        this.result = response.result;
        this.tallyingStartedAt = response.tallying_started_at;
        this.tallyingFinishedAt = response.tallying_finished_at;
    }

    private getObjectToHash() {
        return {
            cast_url: this.castUrl,
            description: this.description,
            frozen_at: this.frozenAt,
            name: this.name,
            openreg: this.openreg,
            public_key: this.publicKeyS,
            questions: this.questions,
            short_name: this.shortName,
            use_voter_aliases: this.useVoterAliases,
            uuid: this.uuid,
            voters_hash: this.votersHash,
            voting_ends_at: this.votingEndsAt,
            voting_starts_at: this.votingStartsAt
        };
    }

    private hashElection() {
        return b64_sha256(Util.toUnicode(JSON.stringify(this.getObjectToHash())));
    }

    public generateHash() {
        this.hash = this.hashElection();
    }

    private getKeyBigInt(s: any) {
        if (s === null) { return null; }
        return {
          g: new BigInt(s.g),
          p: new BigInt(s.p),
          q: new BigInt(s.q),
          y: new BigInt(s.y),
        };
    }

    public isFreeze() {
        return !(this.frozenAt === null);
    }

    public isReady() {
        const startTime: Date = new Date(Date.parse(this.votingStartsAt));
        const isStartTime: any =  Date.now() > startTime.getTime();
        return (this.frozenAt === null) || !isStartTime;
    }

    public isStarted() {
        const startTime: Date = new Date(Date.parse(this.votingStartsAt));
        const isStartTime: any =  Date.now() > startTime.getTime();
        return !this.isReady() && !this.isEnded() && isStartTime;
    }

    public isEnded() {
        const endTime: Date = new Date(Date.parse(this.votingEndsAt));
        const isEndTIme: any = endTime.getTime() < Date.now();
        return !(this.result === null) && isEndTIme;
    }

}
