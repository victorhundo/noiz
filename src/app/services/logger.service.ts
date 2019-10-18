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

  reset(){
    this.logger = [];
  }

  setColumns(nAnswers: number) {
    this.columns = ["Cédula"]
    for (let index = 0; index < nAnswers; index++) {
      this.columns.push(`Opção #${index + 1}`); 
    }
    return this.columns;
  }

  append(s: string) {
    let temp: any = [...this.logger];
    temp.push({
      hash: s,
      answers: new Array<boolean>(this.columns.lenght)
    });
    this.reset()
    this.logger = temp;
    return this.logger;
  }

  postResult(hash:string, value:boolean, answer:number){
    let temp: any = [...this.logger];
    let obj: any;
    let indexSave: number;
    for (let index = 0; index < temp.lenght; index++) {
      this.columns.push(`Opção #${index + 1}`); 
      if (temp[index].hash === hash){
        obj = temp[index];
        indexSave = index;
        break;
      }
    }

    obj.answers[answer] = value;
    temp[indexSave] = obj;
    this.reset();
    this.logger = temp;
    return this.logger;
  }


  }

}
