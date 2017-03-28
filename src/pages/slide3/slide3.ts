import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { Component } from '@angular/core';
import { Nav, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { NewBlankAgendaPage } from '../new-blankagenda/new-blankagenda';
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
import { NewPrivateDiscussionPage } from '../discussions/new-private-discussion/new-private-discussion';
import { PrivateDiscussionsListPage } from '../discussions/private-discussions-list/private-discussions-list';

@Component({
  templateUrl: 'slide3.html',
  selector: 'slide3',
  providers: [AssignmentsListPage, ActiveCouncilsPage,  AgendasPage]
})
export class slide3Page {

  activeCouncilsCount;
  assignmentsCount;
  agendasCount;
  //@ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  userSubscription: Subscription;

  constructor(public nav: NavController,
    public af: AngularFire,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public assignmentsListPage: AssignmentsListPage,
    public activeCouncilsPage: ActiveCouncilsPage,
    private firebaseService: FirebaseService,
    public agendaPage: AgendasPage) {

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
    this.agendasCount = agendaPage.getCount();

  }

  



}