import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';





@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewUserComponent implements OnInit {
  userFormGroup: FormGroup;
  
  constructor(
    private _formBuilder: FormBuilder, 
    private userService:UserService,
    private router: Router) { }
  
  ngOnInit() {
    this.userFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  createUser() {
    var data:any = {
      "user_id": this.userFormGroup.get('email').value,
      "name": this.userFormGroup.get('name').value,
      "info": {
        "password": this.userFormGroup.get('password').value,
      }
    }
    console.log(data)
    var results: Observable<any> = this.userService.postUser(data);
    results.subscribe( res => {
      if(res.status == 201){
        this.router.navigate(['users'])
      }
    })
  }

}
