import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService, private _formBuilder: FormBuilder) { }

  usuario: string;
  senha: string;
  loginFormGroup: FormGroup;

  ngOnInit() {
    this.loginFormGroup = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  logar() {
      const results: Observable<any> = this.authService.login(this.loginFormGroup.value);
      results.subscribe( res => {
        localStorage.setItem('noiz', JSON.stringify(res));
        localStorage.setItem('token', JSON.stringify(res.token));
        this.router.navigate(['']);
      });
    }
}
