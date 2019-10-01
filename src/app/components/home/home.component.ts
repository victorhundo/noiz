import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ElectionService } from 'src/app/services/election.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: any;
  elections: any;
  mainElection: any = {'name':'', 'description':''};;

  constructor(private router: Router, private authService: AuthService, private electionService: ElectionService, private location: Location) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    if(this.authService.getToken() == null) this.router.navigate(['login']);
    this.hasLogged()
    this.getElections()
  }

  hasAdmin() {
    return this.user.admin_p;
  }

  hasElection(){
    return this.elections.length > 0;
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

  freeze() {
    var results: Observable<any> = this.electionService.freezeElection(this.mainElection.uuid,'freeze');
    results.subscribe( res => {
       console.log(res)
       location.reload()
    })
  }

  isNotFreeze(){
    return this.mainElection.frozen_at == null && this.hasAdmin();
  }

  hasLogged(){
      var results: Observable<any> = this.authService.hasLogged();
      results.subscribe( res => {
         if(!res.hasLogged){
           this.router.navigate(['login'])
        }
      })
    }

  changeMainElection(e:any) {
    this.mainElection = e;
  }

  elecitonIsEnd(date:string){
    var endTime: Date = new Date(Date.parse(date));
    return endTime.getTime() < Date.now();
  }

}
