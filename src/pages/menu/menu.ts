import { Component ,ViewChild} from '@angular/core';
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
import { NewCouncilFilePage } from '../files/new-council-file/new-council-file';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { GoodbyePage } from '../goodbye/goodbye';
import { AgendasPage } from '../agendas/agendas';
import { Subscription } from "rxjs";
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { AdminPage } from '../admin/admin.component';
import { CouncilDiscussionsListPage } from '../discussions/council-discussions-list/council-discussions-list'
import { NewAgendaPage } from '../new-agenda/new-agenda';
import { slide1Page } from '../slide1/slide1';
import { slide2Page } from '../slide2/slide2';
import { NewPrivateDiscussionPage } from '../discussions/new-private-discussion/new-private-discussion';
import { PrivateDiscussionsListPage } from '../discussions/private-discussions-list/private-discussions-list';
import { Input, OnInit, OnChanges, SimpleChanges, ElementRef,  AfterViewChecked, AfterViewInit, NgZone } from '@angular/core';
import { Slides } from 'ionic-angular';


@Component({
  selector: 'page-welcome',
  templateUrl: 'menu.html',
  providers: [FirebaseService, AssignmentsListPage, ActiveCouncilsPage, AboutPage, SubmitFeedbackPage, CouncilDiscussionsListPage, AgendasPage, NewPrivateDiscussionPage]
})

export class WelcomePage implements OnInit{
  @ViewChild('switcher') switcher: Slides;
  step:boolean = true;
  images: string[];
 config: Object = {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
      
        };

  activeCouncilsCount;
  assignmentsCount;
  councilDiscussionsCount;
  agendasCount;
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
    public agendaPage: AgendasPage) {

    this.userObj = null;
    
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.firebaseService.getUsersByKey(auth.uid).subscribe(usrs => {
          this.userObj = usrs[0];
          localStorage.setItem('unitType', usrs[0].unittype);
          localStorage.setItem('unitNumber', usrs[0].unitnumber.toString());
          localStorage.setItem('userCouncils', usrs[0].councils.toString());
          localStorage.setItem('isAdmin', usrs[0].isadmin.toString());
        });
      };
    });

    this.activeCouncilsCount = activeCouncilsPage.getCount();
    this.assignmentsCount = assignmentsListPage.getCount();
    this.councilDiscussionsCount = councilDiscussionsListPage.getCount();
    this.agendasCount = agendaPage.getCount();

  }
  ngOnInit() {
  }
  menuOpened() {
    
    this.switcher.update();
    this.switcher.initialSlide = 1;
  }
   loadImages() {
        this.images = [
            'http://api.randomuser.me/portraits/thumb/men/1.jpg',
            'http://api.randomuser.me/portraits/thumb/men/2.jpg'
                             
        ];        
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
  getDataForTable($event: any){ 
    $event.target.classList.add('active');
    this.step=true;
  }
   getData($event: any){ 
    $event.target.classList.add('active');
    this.step=false;
  }

  agendasPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Council',
      buttons: [
        {
          text: 'Add Agenda',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.nav.push(NewAgendaPage);
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
            this.nav.push(NewPrivateDiscussionPage);
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
  viewDiscussions() {
    this.nav.push(CouncilDiscussionsListPage);
  }
  viewPrivateDiscussions() {
    this.nav.push(PrivateDiscussionsListPage);
  }


  viewCouncilAssignments() {
    this.nav.setRoot(AssignmentsListPage);
  }

  viewMyAssignments() {
    this.nav.setRoot(AssignmentsListPage);
  }

  viewSubmitFeedbackPage() {
    this.nav.push(SubmitFeedbackPage);
  }

  viewEditProfilePage() {
    this.nav.push(EditProfilePage);
  }
  viewNewCouncilFilePage(){
    this.nav.push(NewCouncilFilePage);
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
    this.assignmentsListPage.userSubscription.unsubscribe();
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