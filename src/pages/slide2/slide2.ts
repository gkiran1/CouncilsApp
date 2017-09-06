import { FirebaseService } from '../../environments/firebase/firebase-service';
import { MenuPage } from '../menu/menu';
import { Component } from '@angular/core';
import { NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import { AssignmentsListPage } from '../assignments/assignments-list/assignments-list';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { AgendasPage } from '../agendas/agendas';
import { Subscription } from "rxjs";
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { CouncilDiscussionsListPage } from '../discussions/council-discussions-list/council-discussions-list'
import { NewAgendaPage } from '../new-agenda/new-agenda';
import { NewCouncilFilePage } from '../files/new-council-file/new-council-file';
import { FilesListPage } from '../files/files-page/files-page';
import { NewPrivateDiscussionPage } from '../discussions/new-private-discussion/new-private-discussion';
import { PrivateDiscussionsListPage } from '../discussions/private-discussions-list/private-discussions-list';
import { NewNotePage } from '../notes/newnote/newnote';
import { NotesPage } from '../notes/notes/notes';

@Component({
  templateUrl: 'slide2.html',
  selector: 'slide2',
  providers: [AssignmentsListPage, ActiveCouncilsPage, CouncilDiscussionsListPage, AgendasPage, PrivateDiscussionsListPage, FilesListPage, NotesPage]
})
export class slide2Page {

  activeCouncilsCount;
  assignmentsCount;
  councilDiscussionsCount;
  privateDiscussionsCount
  agendasCount;
  filesCount;
  notesCount;
  //@ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  userSubscription: Subscription;
  isAdmin: boolean = false;

  unreadAgendas = [];
  isNewAgenda = false;

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
    public filesListPage: FilesListPage,
    public notesPage: NotesPage,
    public welcomePage: MenuPage
  ) {
    if (localStorage.getItem('isAdmin') === 'true') {
      this.isAdmin = true;
    }
    this.userObj = null;

    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.firebaseService.getUsersByKey(auth.uid).subscribe(usrs => {
          this.userObj = usrs[0];
          localStorage.setItem('unitType', usrs[0].unittype);
          localStorage.setItem('unitNumber', usrs[0].unitnumber.toString());
          localStorage.setItem('userCouncils', usrs[0].councils.toString());
          this.firebaseService.getNotificationsByUserId(auth.uid).subscribe(notifications => {
            this.unreadAgendas = [];
            notifications.forEach(notification => {
              if (notification.nodename === 'agendas' && notification.isread === false && notification.action === 'create') {
                this.unreadAgendas.push(notification);
              }
            });
            if (this.unreadAgendas.length > 0) {
              this.isNewAgenda = true;
            }
            else {
              this.isNewAgenda = false;
            }
          });
        });
      };
    });

    this.activeCouncilsCount = activeCouncilsPage.getCount();
    this.assignmentsCount = assignmentsListPage.getCount();
    this.councilDiscussionsCount = councilDiscussionsListPage.getCount();
    this.privateDiscussionsCount = privateDiscussionsListPage.getCount();

    this.agendasCount = agendaPage.getCount();
    this.notesCount = notesPage.getCount();
    this.filesCount = filesListPage.getCount();

  }
  councilsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Council',
      buttons: [
        {
          text: 'Post Agenda',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.welcomePage.nav.push(NewAgendaPage, {}, { animate: true, direction: 'up' });

          }
        },
        {
          text: 'Start Discussion',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.welcomePage.nav.push(NewCouncilDiscussionPage, {}, { animate: true, direction: 'up' });
          }
        },
        {
          text: 'Create Assignment',
          cssClass: "actionsheet-items",

          handler: () => {

            this.menuctrl.close();
            this.welcomePage.nav.push(NewAssignmentPage, {}, { animate: true, direction: 'up' });
          }
        },
        {
          text: 'Add File',
          cssClass: "actionsheet-items",

          handler: () => {
            this.menuctrl.close();
            this.welcomePage.nav.push(NewCouncilFilePage);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
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
          text: 'Start Discussion',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.welcomePage.nav.push(NewPrivateDiscussionPage);
          }
        },
        {
          text: 'Record Prompting',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.welcomePage.nav.push(NewNotePage);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: "actionsheet-cancel",
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();
  }

  setSelectedClass(button) {

    (document.getElementById('agendasPage')).classList.remove("menu-selected");
    (document.getElementById('discussionsPage')).classList.remove("menu-selected");
    (document.getElementById('assignmentsPage')).classList.remove("menu-selected");
    (document.getElementById('filePage')).classList.remove("menu-selected");
    (document.getElementById('privatediscussionPage')).classList.remove("menu-selected");
    (document.getElementById('notesPage')).classList.remove("menu-selected");

    (document.getElementById(button)).classList.add("menu-selected");
  }

  agendasPage(button) {
    this.setSelectedClass(button);
    this.welcomePage.nav.setRoot(AgendasPage);

  }
  councilDiscussionsPage(button) {
    this.setSelectedClass(button);
    this.welcomePage.nav.setRoot(CouncilDiscussionsListPage);

  }
  assignmentsPage(button) {
    this.setSelectedClass(button);
    this.welcomePage.nav.setRoot(AssignmentsListPage);
  }
  privateDiscussionPage(button) {
    this.setSelectedClass(button);
    this.welcomePage.nav.setRoot(PrivateDiscussionsListPage);
  }
  filesPage(button) {
    this.setSelectedClass(button);
    this.welcomePage.nav.setRoot(FilesListPage);
  }
  notePage(button) {
    this.setSelectedClass(button);
    this.welcomePage.nav.setRoot(NotesPage)
  }

}