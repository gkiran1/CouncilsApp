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
import { Subscription } from "rxjs";

@Component({
  selector: 'page-welcome',
  templateUrl: 'menu.html',
  providers: [FirebaseService, MyAssignmentsPage, CouncilAssignmentsPage, ActiveCouncilsPage, AboutPage, SubmitFeedbackPage, CouncilAssignmentsPage]
})

export class WelcomePage {

  activeCouncilsCount;
  myAssignmentsCount;
  councilAssignmentsCount
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
    private firebaseService: FirebaseService, ) {
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.userObj = this.af.database.object('/users/' + auth.uid);
        this.activeCouncilsCount = activeCouncilsPage.getCount();
        this.myAssignmentsCount = myassignmentpage.getCount();
        this.councilAssignmentsCount = councilAssignmentsPage.getCount();
      }
    });
  }

  councilsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Council',
      buttons: [
        {
          text: 'Add Agenda',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();

            //this.nav.setRoot(NewCouncilPage);

          }
        },
        {
          text: 'Add Discussion',
          cssClass: "actionsheet-items",
          handler: () => {
          }
        },
        {
          text: 'Add Assignment',
          cssClass: "actionsheet-items",

          handler: () => {

            this.menuctrl.close();
            //this.nav.push(InviteMemberPage);

          }
        },
        {
          text: 'Add File',
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
    this.nav.setRoot(ActiveCouncilsPage);
  }

  agendasPage() {

  }

  privatePage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Private',
      buttons: [
        {
          text: 'Add Discussion',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            // this.nav.setRoot(NewAssignmentPage);
          }
        },
        {
          text: 'Add Note',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            // this.nav.setRoot(NewAssignmentPage);
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
  upcomingPage() { }
  pastPage() { }
  discussionsPage() { }
  assignmentsPage() { }

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

  signOut() {
    this.appService.userSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.councilAssignmentsPage.userSubscription.unsubscribe();
    this.activeCouncilsPage.userSubscription.unsubscribe();
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