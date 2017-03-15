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
import * as firebase from 'firebase';
import { WelcomePage } from '../pages/menu/menu';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { NewAssignmentPage } from '../pages/new-assignment/new-assignment';
import { AppService } from '../providers/app-service';
import { Elastic } from '../directives/elastic';
import { NewBlankAgendaPage } from '../pages/new-blankagenda/new-blankagenda';
import { InviteMemberPage } from '../pages/invite/invite';
import { InvitationSuccessPage } from '../pages/invite/success';
import { NewCouncilPage } from '../pages/new-council/new-council'
import { NewCouncilDiscussionPage } from '../pages/discussions/new-council-discussion/new-council-discussion';
import { CouncilAssignmentsPage } from '../pages/council-assignments/council-assignments';
import { MyAssignmentsPage } from '../pages/my-assignments/my-assignments';
import { MomentModule } from 'angular2-moment';
import { ActivityPage } from '../pages/activity/activity'
import { ActiveCouncilsPage } from '../pages/activecouncils/activecouncils'
import { AboutPage } from '../pages/about/about';
import { SubmitFeedbackPage } from '../pages/feedback/submit-feedback/submit-feedback';
import { ThanksFeedbackPage } from '../pages/feedback/thanks-feedback/thanks-feedback';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { ChangePasswordPage } from '../pages/edit-profile/change-password';
import { GoodbyePage } from '../pages/goodbye/goodbye';
import { FormsModule } from '@angular/forms';
import { CouncilUsersPage } from '../pages/councilusers/councilusers';
import { AgendasPage } from '../pages/agendas/agendas';
import { OpenCouncilDiscussionPage } from '../pages/discussions/open-council-discussion/open-council-discussion'
import { AgendaPage } from '../pages/agenda/agenda';
//Ionic Push Module
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { AdminPage } from '../pages/admin/admin.component';
import { InactivateMembersPage } from '../pages/inactivatemembers/inactivate-members/inactivatemembers.component';
import { MemberInactivatedPage } from '../pages/inactivatemembers/member-inactivated/memberinactivated.component';
import { ReactivateMembersPage } from '../pages/reactivatemembers/reactivate-members/reactivatemembers.component';
import { MemberReactivatedPage } from '../pages/reactivatemembers/member-reactivated/memberreactivated.component';
import { CouncilDiscussionsListPage } from '../pages/discussions/council-discussions-list/council-discussions-list';
import { SwiperModule } from '../pages/swiper/swiper.module';
import { MaterialModule } from '@angular/material';


//Cloud Settings - Push Messaging
const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '15fb1041'
  },
  'push': {
    'sender_id': '619253720821',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

//Cloud Settings - Push Messaging

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    DisplayPage,
    WelcomePage,
    CreateAccountPage,
    NewAssignmentPage,
    Elastic,
    NewBlankAgendaPage,
    InviteMemberPage,
    InvitationSuccessPage,
    NewCouncilPage,
    ActivityPage,
    ActiveCouncilsPage,
    NewCouncilDiscussionPage,
    CouncilAssignmentsPage,
    MyAssignmentsPage,
    AboutPage,
    SubmitFeedbackPage,
    ThanksFeedbackPage,
    EditProfilePage,
    ChangePasswordPage,
    GoodbyePage,
    CouncilUsersPage,
    AgendasPage,
    OpenCouncilDiscussionPage,
    AdminPage,
    InactivateMembersPage,
    MemberInactivatedPage,
    ReactivateMembersPage,
    MemberReactivatedPage,
    AgendaPage,
    CouncilDiscussionsListPage
    
  ],

  imports: [
    MaterialModule.forRoot(),
    MomentModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FirebaseConfig),
    //Cloud Module Imports
    CloudModule.forRoot(cloudSettings),
     SwiperModule 
  ],

  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    DisplayPage,
    WelcomePage,
    CreateAccountPage,
    NewAssignmentPage,
    NewBlankAgendaPage,
    InviteMemberPage,
    InvitationSuccessPage,
    NewCouncilPage,
    ActivityPage,
    ActiveCouncilsPage,
    NewCouncilDiscussionPage,
    CouncilAssignmentsPage,
    MyAssignmentsPage,
    AboutPage,
    SubmitFeedbackPage,
    ThanksFeedbackPage,
    EditProfilePage,
    ChangePasswordPage,
    GoodbyePage,
    CouncilUsersPage,
    AgendasPage,
    OpenCouncilDiscussionPage,
    AdminPage,
    InactivateMembersPage,
    MemberInactivatedPage,
    ReactivateMembersPage,
    MemberReactivatedPage,
    AgendaPage,
    CouncilDiscussionsListPage
  ],

  providers: [AuthService, AppService, FirebaseService]
})
export class AppModule { }