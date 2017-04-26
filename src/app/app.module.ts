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
import { MenuPage } from '../pages/menu/menu';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { NewAssignmentPage } from '../pages/assignments/new-assignment/new-assignment';
import { AppService } from '../providers/app-service';
import { Elastic } from '../directives/elastic';
import { AgendaLitePage } from '../pages/agenda-lite/agenda-lite';
import { InviteMemberPage } from '../pages/invite/invite';
import { InvitationSuccessPage } from '../pages/invite/success';
import { NewCouncilPage } from '../pages/new-council/new-council'
import { NewCouncilDiscussionPage } from '../pages/discussions/new-council-discussion/new-council-discussion';
import { AssignmentsListPage } from '../pages/assignments/assignments-list/assignments-list';
import { MomentModule } from 'angular2-moment';
import { ActivityPage } from '../pages/activity/activity'
import { ActiveCouncilsPage } from '../pages/activecouncils/activecouncils'
import { AboutPage } from '../pages/about/about';
import { SubmitFeedbackPage } from '../pages/feedback/submit-feedback/submit-feedback';
import { ThanksFeedbackPage } from '../pages/feedback/thanks-feedback/thanks-feedback';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { NewCouncilFilePage } from '../pages/files/new-council-file/new-council-file';
import { OpenCouncilFilePage } from '../pages/files/open-council-file/open-council-file';
import { ViewCouncilFilePage } from '../pages/files/view-council-file/view-council-file';
import { FilesListPage } from '../pages/files/files-page/files-page';
import { ChangePasswordPage } from '../pages/edit-profile/change-password';
import { GoodbyePage } from '../pages/goodbye/goodbye';
import { FormsModule } from '@angular/forms';
import { CouncilUsersPage } from '../pages/councilusers/councilusers';
import { AgendasPage } from '../pages/agendas/agendas';
import { AgendaPage } from '../pages/agenda/agenda';
import { OpenCouncilDiscussionPage } from '../pages/discussions/open-council-discussion/open-council-discussion'
import { AgendaLiteEditPage } from '../pages/agenda-lite-edit/agenda-lite-edit';
import { AgendaEditPage } from '../pages/agenda-edit/agenda-edit';
import { ForgotPwd } from '../pages/forgotpwd/forgotpwd';
import { ForgotPwdSuccess } from '../pages/forgotpwd/forgotpwd-success';

//Ionic Push Module
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { AdminPage } from '../pages/admin/admin.component';
import { SettingsPage } from '../pages/settings/settings';
import { InactivateMembersPage } from '../pages/inactivatemembers/inactivate-members/inactivatemembers.component';
import { MemberInactivatedPage } from '../pages/inactivatemembers/member-inactivated/memberinactivated.component';
import { ReactivateMembersPage } from '../pages/reactivatemembers/reactivate-members/reactivatemembers.component';
import { MemberReactivatedPage } from '../pages/reactivatemembers/member-reactivated/memberreactivated.component';
import { CouncilDiscussionsListPage } from '../pages/discussions/council-discussions-list/council-discussions-list';
import { SwiperModule } from '../pages/swiper/swiper.module';
import { NewAgendaPage } from '../pages/new-agenda/new-agenda';
import { MaterialModule } from '@angular/material';
import { slide1Page } from '../pages/slide1/slide1';
import { slide2Page } from '../pages/slide2/slide2';
import { slide3Page } from '../pages/slide3/slide3';
import { NoAccessPage } from '../pages/noaccess/noaccess.component';
import { TransferAdminRightsPage } from '../pages/transferadminrights/transfer-adminrights/transferadminrights.component';
import { Search } from '../pipes/search';
import { NewPrivateDiscussionPage } from '../pages/discussions/new-private-discussion/new-private-discussion';
import { OpenPrivateDiscussionPage } from '../pages/discussions/open-private-discussion/open-private-discussion';
import { PrivateDiscussionsListPage } from '../pages/discussions/private-discussions-list/private-discussions-list';
import { TransferCompletePage } from '../pages/transferadminrights/transfer-complete/transfercomplete.component';
import { UnitTypeAgendaPage } from '../pages/unittype-agenda/unittype-agenda';
import { CustomDateFormat } from '../pipes/custom-date-format';
import { CustomTimeFormat } from '../pipes/custom-time-format';
import { CouncilUsersModalPage } from '../modals/council-users/council-users';
import { NotificationsPage } from '../pages/notifications/notifications-page/notifications.component';
import { NotificationSettingsPage } from '../pages/notifications/notifications-settings/notificationsettings.component';
import { UserCouncilsModalPage } from '../modals/user-councils/user-councils';
import { DonationsWelcomePage } from '../pages/donations/donations-welcome/donations-welcome';
import { DonationsSendPage } from '../pages/donations/donations-send/donations-send';
import { DonationsThankyouPage } from '../pages/donations/donations-thankyou/donations-thankyou';
import { MembersListPage } from '../pages/editmembers/members-list/memberslist.component';
import { EditMemberPage } from '../pages/editmembers/edit-member/editmember.component';
import { EditCompletePage } from '../pages/editmembers/edit-complete/editcomplete.component';
import { NewNotePage } from '../pages/notes/newnote/newnote';
import { NotesPage } from '../pages/notes/notes/notes';
import { NotePage } from '../pages/notes/note/note';
import { GoogleCalenderPage } from '../pages/googlecalender/googlecalender.component';

//Directives
import { TabindexDirective } from '../directives/tabindex.directive';

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
    MenuPage,
    CreateAccountPage,
    NewAssignmentPage,
    Elastic,
    AgendaLitePage,
    InviteMemberPage,
    InvitationSuccessPage,
    NewCouncilPage,
    ActivityPage,
    ActiveCouncilsPage,
    NewCouncilDiscussionPage,
    AssignmentsListPage,
    AboutPage,
    SubmitFeedbackPage,
    ThanksFeedbackPage,
    EditProfilePage,
    ChangePasswordPage,
    NewCouncilFilePage,
    OpenCouncilFilePage,
    ViewCouncilFilePage,
    FilesListPage,
    GoodbyePage,
    CouncilUsersPage,
    AgendasPage,
    AgendaPage,
    OpenCouncilDiscussionPage,
    AdminPage,
    SettingsPage,
    InactivateMembersPage,
    MemberInactivatedPage,
    ReactivateMembersPage,
    MemberReactivatedPage,
    CouncilDiscussionsListPage,
    slide1Page,
    slide2Page,
    AgendaLiteEditPage,
    AgendaEditPage,
    NewAgendaPage,
    NoAccessPage,
    TransferAdminRightsPage,
    NewPrivateDiscussionPage,
    Search,
    OpenPrivateDiscussionPage,
    PrivateDiscussionsListPage,
    TransferCompletePage,
    CustomDateFormat,
    CustomTimeFormat,
    UnitTypeAgendaPage,
    slide3Page,
    CouncilUsersModalPage,
    NotificationsPage,
    NotificationSettingsPage,
    UserCouncilsModalPage,
    DonationsWelcomePage,
    DonationsSendPage,
    DonationsThankyouPage,
    MembersListPage,
    EditMemberPage,
    EditCompletePage,
    NewNotePage,
    NotesPage,
    NotePage,
    GoogleCalenderPage,
    TabindexDirective,
    ForgotPwd,
    ForgotPwdSuccess
  ],

  imports: [
    MaterialModule.forRoot(),
    MomentModule,
    FormsModule,
    IonicModule.forRoot(MyApp, { platforms: { ios: { statusbarPadding: true } } }),
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
    MenuPage,
    CreateAccountPage,
    NewAssignmentPage,
    AgendaLitePage,
    InviteMemberPage,
    InvitationSuccessPage,
    NewCouncilPage,
    ActivityPage,
    ActiveCouncilsPage,
    NewCouncilDiscussionPage,
    AssignmentsListPage,
    AboutPage,
    SubmitFeedbackPage,
    ThanksFeedbackPage,
    EditProfilePage,
    ChangePasswordPage,
    NewCouncilFilePage,
    OpenCouncilFilePage,
    ViewCouncilFilePage,
    FilesListPage,
    GoodbyePage,
    CouncilUsersPage,
    AgendasPage,
    AgendaPage,
    AgendaEditPage,
    OpenCouncilDiscussionPage,
    AdminPage,
    SettingsPage,
    InactivateMembersPage,
    MemberInactivatedPage,
    ReactivateMembersPage,
    MemberReactivatedPage,
    CouncilDiscussionsListPage,
    AgendaLiteEditPage,
    NewAgendaPage,
    NoAccessPage,
    TransferAdminRightsPage,
    NewPrivateDiscussionPage,
    OpenPrivateDiscussionPage,
    PrivateDiscussionsListPage,
    TransferCompletePage,
    UnitTypeAgendaPage,
    CouncilUsersModalPage,
    NotificationsPage,
    NotificationSettingsPage,
    UserCouncilsModalPage,
    DonationsWelcomePage,
    DonationsSendPage,
    DonationsThankyouPage,
    MembersListPage,
    EditMemberPage,
    EditCompletePage,
    NewNotePage,
    NotesPage,
    NotePage,
    GoogleCalenderPage,
    ForgotPwd,
    ForgotPwdSuccess
  ],

  providers: [AuthService, AppService, FirebaseService]
})
export class AppModule { }