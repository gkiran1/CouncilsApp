import { Component, ViewChild } from '@angular/core';
import { Nav, NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AppService } from '../../providers/app-service';
import { NewAgenda } from '../new-agenda/new-agenda';
import { NewAssignmentPage } from '../new-assignment/new-assignment'

@Component({
  selector: 'welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  constructor(public af: AngularFire, public appService: AppService) {
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

  agendasPage() {
    this.nav.setRoot(NewAgenda);
  }

  assignmentsPage() {
    this.nav.setRoot(NewAssignmentPage);
  }
  // pages: Array<{ title: string, component: any }>;
  // openPage(page) {
  //   // Reset the content nav to have just this page
  //   // we wouldn't want the back button to show in this scenario
  //   this.nav.setRoot(page.component);
  // }
}