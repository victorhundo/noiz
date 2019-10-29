import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {

  title = 'Angular-Interceptor';
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    if (this.data.reason === 'Bad Username or Password' ) {
      this.data.reason = 'Usuário ou Senha Inválido';
    } else if (this.data.reason === 'At least one vote must be cast before you do the tally') {
      this.data.reason = 'Ao Menos Um Voto Deve Ser Depositado Antes de Começar a Apuração';
    } else if (this.data.reason === 'Admin is not allowed to be a voter.') {
      this.data.reason = 'Usuário Administrador Não Está Autorizado para Votar';
    } else if (this.data.reason === 'Voter matching query does not exist.') {
      this.data.reason = 'Você Não Está Autorizado para Votar nessa Eleição';
    }
  }


}
