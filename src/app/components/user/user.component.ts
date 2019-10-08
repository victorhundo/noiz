import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users:any = [];
  displayedColumns: string[] = ['Username','Name','Email', 'Edit', 'Remove'];
  constructor(private userService:UserService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(){
    var results: Observable<any> = this.userService.getUsers();
    results.subscribe( res => {
      this.users = res;
      console.log(res);
    })
  }

}
