import { Component, OnInit } from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(
    private sidenav: SidenavService,
    private router: Router) { }

  ngOnInit() {
  }

  goto(route: string) {
    this.sidenav.toggle();
    this.router.navigate([route]);
  }
}
