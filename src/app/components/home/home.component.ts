import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: any;

  constructor(private router: Router, private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.hasLogged()
    // if(this.authService.getToken() == null) this.router.navigate(['login']);
  }

  hasAdmin() {
    return this.user.admin_p;
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
