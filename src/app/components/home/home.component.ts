import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    if(localStorage.getItem('login') == null) this.router.navigate(['login']);
    else{
      var aluno = JSON.parse(localStorage.getItem('login'));
    }
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login'])
  }


}
