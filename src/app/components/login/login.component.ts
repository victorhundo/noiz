import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) { }

  usuario: string;
  senha: string;

  ngOnInit() {
  }

  logar(){
      var model =  {username:this.usuario, password:this.senha}
      var results: Observable<any> = this.authService.login(model);
      results.subscribe( res => {
        localStorage.setItem('noiz',JSON.stringify(res));
        this.router.navigate([''])
      })
    }
}
