import { Component, ViewChild } from '@angular/core';
import { Nav, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { NewBlankAgendaPage } from '../new-blankagenda/new-blankagenda';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { NewCouncilPage } from '../new-council/new-council';
import { InviteMemberPage } from '../invite/invite';
import { CouncilAssignmentsPage } from '../council-assignments/council-assignments';
import { MyAssignmentsPage } from '../my-assignments/my-assignments';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { AboutPage } from '../about/about';
import { SubmitFeedbackPage } from '../feedback/submit-feedback/submit-feedback';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { GoodbyePage } from '../goodbye/goodbye';
import { AgendasPage } from '../agendas/agendas';
import { Subscription } from "rxjs";
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { AdminPage } from '../admin/admin.component';
import { CouncilDiscussionsListPage } from '../discussions/council-discussions-list/council-discussions-list'

@Component({
  selector: 'page-welcome',
  templateUrl: 'menu.html',
  providers: [FirebaseService, MyAssignmentsPage, CouncilAssignmentsPage, ActiveCouncilsPage, AboutPage, SubmitFeedbackPage, CouncilAssignmentsPage,CouncilDiscussionsListPage]
})

export class WelcomePage {

  activeCouncilsCount;
  myAssignmentsCount;
  councilAssignmentsCount;
  councilDiscussionsCount;
  @ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  userSubscription: Subscription;

  constructor(public af: AngularFire,
    public appService: AppService,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public myassignmentpage: MyAssignmentsPage,
    public councilAssignmentsPage: CouncilAssignmentsPage,
    public activeCouncilsPage: ActiveCouncilsPage,
    private firebaseService: FirebaseService,
    public councilDiscussionsListPage:CouncilDiscussionsListPage ) {

    this.userSubscription = this.af.auth.subscribe(auth => {
      this.userObj = this.af.database.object('/users/' + auth.uid);

      this.userObj.subscribe(usr => {
        localStorage.setItem('unitType', usr.unittype)
        localStorage.setItem('unitNumber', usr.unitnumber.toString())
        localStorage.setItem('userCouncils', usr.councils.toString())
      });
    });
    this.activeCouncilsCount = activeCouncilsPage.getCount();
    this.myAssignmentsCount = myassignmentpage.getCount();
    this.councilAssignmentsCount = councilAssignmentsPage.getCount();
    this.councilDiscussionsCount = councilDiscussionsListPage.getCount();
  }

  councilsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Councils',
      buttons: [
        {
          text: 'Create Council',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();

            this.nav.setRoot(NewCouncilPage);

          }
        },
        {
          text: 'Create Note',
          cssClass: "actionsheet-items",
          handler: () => {
          }
        },
        {
          text: 'Invite Members',
          cssClass: "actionsheet-items",

          handler: () => {

            this.menuctrl.close();
            this.nav.push(InviteMemberPage);

          }
        },
        {
          text: 'Inactivate Members',
          cssClass: "actionsheet-items",

          handler: () => {
          }
        },
        {
          text: 'Edit Members',
          cssClass: "actionsheet-items",

          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Reactivate Members',
          cssClass: "actionsheet-items",

          handler: () => {
          }
        },
        {
          text: 'Transfers Admin Rights',
          cssClass: "actionsheet-items",

          handler: () => {
          }
        },
        {
          text: 'Cancel',
          cssClass: "actionsheet-cancel",
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();
  }

  activePage() {
    this.nav.push(ActiveCouncilsPage);
  }

  agendasPage() {
    this.nav.push(NewBlankAgendaPage);
  }

  assignmentsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Assignments',
      buttons: [
        {
          text: 'New Assignment',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewAssignmentPage);
          }
        },
        {
          text: 'Cancel',
          cssClass: "actionsheet-cancel",
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();
  }
  notesPage() { }

  upcomingPage() {
    this.nav.setRoot(AgendasPage);
  }
  pastPage() { }
  discussionsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Discussions',
      buttons: [
        {
          text: 'Council',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewCouncilDiscussionPage);
          }
        },
        {
          text: 'Private',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewCouncilDiscussionPage);
          }
        },
        {
          text: 'Cancel',
          cssClass: "actionsheet-cancel",
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();
  }
  viewDiscussions(){
    this.nav.push(CouncilDiscussionsListPage);
  }
  privatePage() { }

  viewCouncilAssignments() {
    this.nav.setRoot(CouncilAssignmentsPage);
  }

  viewMyAssignments() {
    this.nav.setRoot(MyAssignmentsPage);
  }

  viewSubmitFeedbackPage() {
    this.nav.push(SubmitFeedbackPage);
  }

  viewEditProfilePage() {
    this.nav.push(EditProfilePage);
  }

  viewAboutPage() {
    this.nav.push(AboutPage);
  }

  viewAdminPage() {
    this.nav.setRoot(AdminPage);
  }

  signOut() {
    this.appService.userSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.councilAssignmentsPage.userSubscription.unsubscribe();
    this.activeCouncilsPage.userSubscription.unsubscribe();
    this.councilDiscussionsListPage.userSubscription.unsubscribe();
    localStorage.setItem('securityToken', null);
    localStorage.setItem('isUserLoggedIn', 'false');
    this.firebaseService.signOut().then(() => {
      console.log('Sign Out successfully..');
      this.nav.setRoot(GoodbyePage);
    }).catch(err => {
      this.nav.setRoot(GoodbyePage);
      alert(err);
    })
  }

}