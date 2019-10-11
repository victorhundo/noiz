import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { EletctionComponent } from './components/eletction/eletction.component';
import { BoothComponent } from './components/booth/booth.component';
import { UserComponent } from './components/user/user.component';
import { NewUserComponent } from './components/user/new/new.component';
import { VerifierComponent } from './components/verifier/verifier.component';



const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'elections/new', component: EletctionComponent },
  { path: 'booth/:short_name', component: BoothComponent },
  { path: 'users', component: UserComponent },
  { path: 'users/new', component: NewUserComponent },
  { path: 'verifier/:short_name', component: VerifierComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
