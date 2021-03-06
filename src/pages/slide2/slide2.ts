import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { Component } from '@angular/core';
import { Nav, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { AgendaLitePage } from '../agenda-lite/agenda-lite';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import { NewCouncilPage } from '../new-council/new-council';
import { InviteMemberPage } from '../invite/invite';
import { AssignmentsListPage } from '../assignments/assignments-list/assignments-list';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { AboutPage } from '../about/about';
import { SubmitFeedbackPage } from '../feedback/submit-feedback/submit-feedback';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { GoodbyePage } from '../goodbye/goodbye';
import { AgendasPage } from '../agendas/agendas';
import { Subscription } from "rxjs";
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { AdminPage } from '../admin/admin.component';
import { CouncilDiscussionsListPage } from '../discussions/council-discussions-list/council-discussions-list'
import { NewAgendaPage } from '../new-agenda/new-agenda';
import { slide1Page } from '../slide1/slide1';
import { NewCouncilFilePage } from '../files/new-council-file/new-council-file';
import { FilesListPage } from '../files/files-page/files-page';
import { NewPrivateDiscussionPage } from '../discussions/new-private-discussion/new-private-discussion';
import { PrivateDiscussionsListPage } from '../discussions/private-discussions-list/private-discussions-list';

@Component({
  templateUrl: 'slide2.html',
  selector: 'slide2',
  providers: [AssignmentsListPage, ActiveCouncilsPage, CouncilDiscussionsListPage, AgendasPage, PrivateDiscussionsListPage, FilesListPage]
})
export class slide2Page {

  activeCouncilsCount;
  assignmentsCount;
  councilDiscussionsCount;
  privateDiscussionsCount
  agendasCount;
  filesCount;
  //@ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  userSubscription: Subscription;

  constructor(public nav: NavController,
    public af: AngularFire,
    public appService: AppService,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public assignmentsListPage: AssignmentsListPage,
    public activeCouncilsPage: ActiveCouncilsPage,
    private firebaseService: FirebaseService,
    public councilDiscussionsListPage: CouncilDiscussionsListPage,
    public agendaPage: AgendasPage,
    public privateDiscussionsListPage: PrivateDiscussionsListPage,
    public filesListPage: FilesListPage) {

    this.userObj = null;

    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.firebaseService.getUsersByKey(auth.uid).subscribe(usrs => {
          this.userObj = usrs[0];
          localStorage.setItem('unitType', usrs[0].unittype)
          localStorage.setItem('unitNumber', usrs[0].unitnumber.toString())
          localStorage.setItem('userCouncils', usrs[0].councils.toString())
        });
      };
    });

    this.activeCouncilsCount = activeCouncilsPage.getCount();
    this.assignmentsCount = assignmentsListPage.getCount();
    this.councilDiscussionsCount = councilDiscussionsListPage.getCount();
    this.privateDiscussionsCount = privateDiscussionsListPage.getCount();
    this.agendasCount = agendaPage.getCount();
    this.filesCount = filesListPage.getCount();

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
            this.nav.setRoot(NewAgendaPage);

          }
        },
        {
          text: 'Add Discussion',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewCouncilDiscussionPage);
          }
        },
        {
          text: 'Add Assignment',
          cssClass: "actionsheet-items",

          handler: () => {

            this.menuctrl.close();
            this.nav.push(NewAssignmentPage);
          }
        },
        {
          text: 'Add File',
          cssClass: "actionsheet-items",

          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewCouncilFilePage);
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
  privatePage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Private',
      buttons: [
        {
          text: 'Add Discussion',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewPrivateDiscussionPage);
          }
        },
        {
          text: 'Add Note',
          cssClass: "actionsheet-items",
          handler: () => {
            // this.menuctrl.close();
            // this.nav.push();
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

  agendasPage() {
    this.nav.push(AgendasPage);

  }
  councilDiscussionsPage() {
    this.nav.push(CouncilDiscussionsListPage);

  }
  assignmentsPage() {
    this.nav.push(AssignmentsListPage);
  }
  privateDiscussionPage() {
    this.nav.push(PrivateDiscussionsListPage);
  }
  filesPage() {
    this.nav.push(FilesListPage);
  }

}