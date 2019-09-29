import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ElectionService } from 'src/app/services/election.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: any;
  elections: any;
  mainElection: any;

  constructor(private router: Router, private authService: AuthService, private electionService: ElectionService) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.hasLogged()
    this.getElections()
    // if(this.authService.getToken() == null) this.router.navigate(['login']);
  }

  hasAdmin() {
    return this.user.admin_p;
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }

  getElections(){
    var results: Observable<any> = this.electionService.getElections();
    results.subscribe( res => {
       this.elections = res;
       if (res.length > 0){
         this.mainElection = res[0]
       }
       console.log(this.mainElection)
    })
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
