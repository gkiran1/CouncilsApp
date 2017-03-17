import { Component, ViewChild } from '@angular/core';
import { NavController,ActionSheetController, MenuController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';
import { ReactivateMembersPage } from '../reactivatemembers/reactivate-members/reactivatemembers.component';
import { TransferAdminRightsPage } from '../transferadminrights/transfer-adminrights/transferadminrights.component';
import { InviteMemberPage } from '../invite/invite';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { NewCouncilPage } from '../new-council/new-council';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { SubmitFeedbackPage } from '../feedback/submit-feedback/submit-feedback';
import { AboutPage } from '../about/about';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AgendasPage } from '../agendas/agendas';
import { AssignmentsListPage } from '../assignments/assignments-list/assignments-list';
import { CouncilDiscussionsListPage } from '../discussions/council-discussions-list/council-discussions-list'
import { Subscription } from "rxjs";
import { GoodbyePage } from '../goodbye/goodbye';
@Component({
    selector: 'settings-page',
    templateUrl: 'settings.html',
    providers: [FirebaseService, AssignmentsListPage, ActiveCouncilsPage, AboutPage, SubmitFeedbackPage, CouncilDiscussionsListPage, AgendasPage]

})

export class SettingsPage {
    userSubscription: Subscription;
    constructor(private navCtrl: NavController,    
    public appService: AppService,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public assignmentsListPage: AssignmentsListPage,
    public activeCouncilsPage: ActiveCouncilsPage,
    private firebaseService: FirebaseService,
    public councilDiscussionsListPage: CouncilDiscussionsListPage,
    public agendaPage: AgendasPage) { }

    viewEditProfilePage() {
        this.navCtrl.push(EditProfilePage);
    }
    viewFeedbackPage() {
        this.navCtrl.push(SubmitFeedbackPage);
    }
    viewAboutUSPage() {
        this.navCtrl.push(AboutPage);
    }
    signOut() {
    this.appService.userSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.assignmentsListPage.userSubscription.unsubscribe();
    this.activeCouncilsPage.userSubscription.unsubscribe();
    this.councilDiscussionsListPage.userSubscription.unsubscribe();
    localStorage.setItem('securityToken', null);
    localStorage.setItem('isUserLoggedIn', 'false');
    this.firebaseService.signOut().then(() => {
      console.log('Sign Out successfully..');
      this.navCtrl.setRoot(GoodbyePage);
    }).catch(err => {
      this.navCtrl.setRoot(GoodbyePage);
      alert(err);
    })
  }
}