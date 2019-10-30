import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {

  title = 'Ops.. Algo Deu Errado :(';
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private router: Router) {}

  ngOnInit() {
    if (this.data.reason === 'Bad Username or Password' ) {
      this.data.reason = 'Usuário ou Senha Inválido';
    } else if (this.data.reason === 'At least one vote must be cast before you do the tally') {
      this.data.reason = 'Ao Menos Um Voto Deve Ser Depositado Antes de Começar a Apuração';
    } else if (this.data.reason === 'Admin is not allowed to be a voter.') {
      this.data.reason = 'Usuário Administrador Não Está Autorizado para Votar';
    } else if (this.data.reason === 'Voter matching query does not exist.') {
      this.data.reason = 'Você Não Está Autorizado para Votar nessa Eleição';
    } else if (this.data.reason === 'User not logged in to the system.') {
      localStorage.clear();
      this.title = 'Você Está Desconectado';
      this.data.reason = 'Para Continuar Efetue o Login.';
      this.router.navigate(['login'], {queryParams: {back_url: this.data.back_url}});
    }
  }


}
