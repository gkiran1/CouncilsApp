import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthService } from '../providers/auth-service';
import { RegisterPage } from '../pages/register/register';
import { AngularFireModule } from 'angularfire2';
import { FirebaseConfig } from './../environments/firebase/firebase-config';
import { FirebaseService } from './../environments/firebase/firebase-service';
import { DisplayPage } from '../pages/display/display';
import { CouncilLoginPage } from '../pages/councillogin/councillogin';
import * as firebase from 'firebase';
import { WelcomePage } from '../pages/welcome/welcome';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { NewAssignmentPage } from '../pages/new-assignment/new-assignment';
import { AppService } from '../providers/app-service';
import { Elastic } from '../directives/elastic'; 
import { NewAgenda } from '../pages/new-agenda/new-agenda';
import { InviteMemberPage } from '../pages/invite/invite';
import { InvitationSuccessPage } from '../pages/invite/success';
import { NewCouncilDiscussionPage } from '../pages/new-council-discussion/new-council-discussion';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    DisplayPage,
    CouncilLoginPage,
    WelcomePage,
    CreateAccountPage,
    NewAssignmentPage,
    Elastic,
    NewAgenda,
    InviteMemberPage,
    InvitationSuccessPage,
    NewCouncilDiscussionPage
   
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FirebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    DisplayPage,
    CouncilLoginPage,
    WelcomePage,
    CreateAccountPage,
    NewAssignmentPage,
    NewAgenda,
    InviteMemberPage,
    InvitationSuccessPage,
    NewCouncilDiscussionPage

  ],
  providers: [AuthService,AppService,FirebaseService]
})
export class AppModule { }