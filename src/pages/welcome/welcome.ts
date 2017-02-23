import { Component, ViewChild } from '@angular/core';
import { Nav, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { NewAgenda } from '../new-agenda/new-agenda';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
// import { NewCouncilPage } from '../new-council/new-council';
import { InviteMemberPage } from '../invite/invite';
import { CouncilAssignmentPage } from '../council-assignments/council-assignments';


@Component({
  selector: 'welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  constructor(public af: AngularFire, public appService: AppService, public actionSheetCtrl: ActionSheetController, public menuctrl: MenuController) {
    this.af.auth.subscribe(auth => {
      this.userObj = this.af.database.object('/users/' + auth.uid);
      // appService.setUser(this.userObj);

      // var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      // var lastname = currentUser.lastname;
      // console.log("currentUser==",currentUser);

    });


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
            // this.nav.push(NewCouncilPage);
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
            this.nav.setRoot(InviteMemberPage);
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


  agendasPage() {
    this.nav.setRoot(NewAgenda);
  }

  assignmentsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Assignments',
      cssClass: "cancelcolor",
      buttons: [
        {
          text: 'Council',
          cssClass: "classcolor",
          handler: () => {
            this.menuctrl.close();
            this.nav.setRoot(NewAssignmentPage);
          }
        },
        {
          text: 'Private',
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
  activePage() {
  }
  notesPage() { }
  upcomingPage() { }
  pastPage() { }
  discussionsPage() { }

  viewCouncilAssignments(){
    this.nav.setRoot(CouncilAssignmentPage);
  }
}