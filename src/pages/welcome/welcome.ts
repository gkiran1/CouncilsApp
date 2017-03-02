import { Component, ViewChild } from '@angular/core';
import { Nav, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { NewAgenda } from '../new-agenda/new-agenda';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { NewCouncilPage } from '../new-council/new-council';
import { InviteMemberPage } from '../invite/invite';
import { CouncilAssignmentsPage } from '../council-assignments/council-assignments';
import { MyAssignmentsPage } from '../my-assignments/my-assignments';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { AboutPage } from '../about/about';
import { SubmitFeedbackPage } from '../feedback/submit-feedback/submit-feedback';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { GoodbyePage } from '../goodbye/goodbye';
import { Subscription } from "rxjs";

@Component({
    selector: 'page-welcome',
  templateUrl: 'welcome.html',
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
      console.log('text================>', auth.uid, )
      this.userObj = this.af.database.object('/users/' + auth.uid);
      // appService.setUser(this.userObj);

      // var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      // var lastname = currentUser.lastname;
      // console.log("currentUser==",currentUser);
    });
    this.activeCouncilsCount = activeCouncilsPage.getCount();
    this.myAssignmentsCount = myassignmentpage.getCount();
    this.councilAssignmentsCount = councilAssignmentsPage.getCount();

    // this.pages = [
    //   { title: 'Home Page', component: HomePage }
    // ];
  }

  councilsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Councils',
      cssClass: "cancelcolor",
      buttons: [
        {
          text: 'Create Council',
          cssClass: "classcolor",
          handler: () => {
            this.menuctrl.close();

            this.nav.push(NewCouncilPage);

          }
        },
        {
          text: 'Create Note',
          cssClass: "classcolor",
          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Invite Members',
          cssClass: "classcolor",

          handler: () => {

            this.menuctrl.close();
            this.nav.push(InviteMemberPage);

          }
        },
        {
          text: 'Inactivate Members',
          cssClass: "classcolor",

          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Edit Members',
          cssClass: "classcolor",

          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Reactivate Members',
          cssClass: "classcolor",

          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Transfers Admin Rights',
          cssClass: "classcolor",

          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Cancel',
          cssClass: "cancelcolor",
          handler: () => {
            console.log('Cancel clicked');
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
    this.nav.setRoot(NewAgenda);
  }

  assignmentsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Assignments',
      cssClass: "cancelcolor",
      buttons: [
        {
          text: 'New Assignment',
          cssClass: "classcolor",
          handler: () => {
            this.menuctrl.close();
            this.nav.setRoot(NewAssignmentPage);
          }
        },
        {
          text: 'Cancel',
          cssClass: "cancelcolor",
          handler: () => {
            console.log('Cancel clicked');
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
  privatePage(){}

  viewCouncilAssignments() {
    this.nav.setRoot(CouncilAssignmentsPage);
  }

  viewMyAssignments() {
    this.nav.setRoot(MyAssignmentsPage);
  }

  viewSubmitFeedbackPage() {
    this.nav.push(SubmitFeedbackPage);
  }

  viewAboutPage() {
    this.nav.push(AboutPage);
  }

  signOut() {
    this.appService.userSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.firebaseService.signOut().then(() => {
      console.log('Sign Out successfully..')
      this.nav.setRoot(GoodbyePage);
    }).catch(err => {
      this.nav.setRoot(GoodbyePage);
      alert(err);
    })
  }

}