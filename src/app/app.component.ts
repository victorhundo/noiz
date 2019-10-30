import { Component, ViewChild, OnInit} from '@angular/core';
import { SidenavService } from 'src/app/services/sidenav.service';
import { MatSidenav } from '@angular/material';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav',  {static: true}) public sidenav: MatSidenav;
  constructor(
    private router: Router,
    private sidenavService: SidenavService,
    private authService: AuthService) {
      if ( !this.isLoginPath() ) {
        this.authService.hasLogged().subscribe((res: any) => {
          if (!res.message.hasLogged) {
            localStorage.clear();
            this.router.navigate(['login']);
         }
        });
      }
    }

  title = 'noiz';
  ngOnInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  isLoginPath() {
    return location.pathname === '/login';
  }
}
