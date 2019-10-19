import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  logger:any = [];
  columns: any = [];
  constructor() {  }

  get() {
    return this.logger;
  }

  len() {
    return this.logger.length;
  }

  reset() {
    this.logger = [];
  }

  setColumns(answers: any) {
    this.columns = ['Cédula'] ;
    if (answers) {
      answers.forEach((e: any) => {
        this.columns.push(e.answer);
      });
    }
    return this.columns;
  }

  append(s: string) {
    const temp: any = [...this.logger];
    temp.push({
      hash: s,
      answers: new Array<boolean>(this.columns.length - 1)
    });
    this.reset();
    this.logger = temp;
    return this.logger;
  }

  postResult(hash: string, value: boolean, answer: number) {
    const temp: any = [...this.logger];
    const index: any = temp.findIndex((x: any) => x.hash === hash);
    const obj: any = temp[index];

    obj.answers[answer] = value;
    temp[index] = obj;
    this.reset();
    this.logger = temp;
    return this.logger;
  }

}
