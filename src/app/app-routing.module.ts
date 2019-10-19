import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ElectionComponent } from './components/election/election.component';
import { EditElectionComponent } from './components/election/edit/edit.component';
import { BoothComponent } from './components/booth/booth.component';
import { UserComponent } from './components/user/user.component';
import { NewUserComponent } from './components/user/new/new.component';
import { VerifierComponent } from './components/verifier/verifier.component';



const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'elections', component: ElectionComponent },
  { path: 'elections/:short_name/edit', component: EditElectionComponent },
  { path: 'booth/:short_name', component: BoothComponent },
  { path: 'users', component: UserComponent },
  { path: 'users/new', component: NewUserComponent },
  { path: 'elections/:short_name/verify', component: VerifierComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
