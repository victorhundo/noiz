import { Component, ViewChild, OnInit} from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav.service';
import { MatSidenav } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav',  {static: true}) public sidenav: MatSidenav;
  constructor(private sidenavService: SidenavService) {  }
  title = 'noiz';
  ngOnInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }
}
