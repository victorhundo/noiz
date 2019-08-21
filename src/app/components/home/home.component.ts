import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.hasLogged()
    // if(this.authService.getToken() == null) this.router.navigate(['login']);
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login'])
  }

  hasLogged(){
      var results: Observable<any> = this.authService.hasLogged();
      results.subscribe( res => {
         if(!res.hasLogged){
           this.router.navigate(['login'])
        }
      })
    }


}
