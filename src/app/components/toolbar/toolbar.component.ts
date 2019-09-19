import { Component, AfterViewChecked, ElementRef, ViewChild, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { SidenavService } from 'src/app/services/sidenav.service';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  constructor(private router: Router, private sidenav: SidenavService){ }

  ngOnInit() { }

  toggleSidenav() {
    this.sidenav.toggle()
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['login'])
  }

  isRouteLogin(){
    return this.router.url === '/login'
  }

}
