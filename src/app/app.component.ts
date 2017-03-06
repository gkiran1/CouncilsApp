import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { DisplayPage } from '../pages/display/display';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { WelcomePage } from '../pages/welcome/welcome';
import { InviteMemberPage } from '../pages/invite/invite';
import { NewCouncilPage } from '../pages/new-council/new-council';
import { NewAssignmentPage } from '../pages/new-assignment/new-assignment';
import { CouncilAssignmentsPage } from '../pages/council-assignments/council-assignments';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})

export class MyApp {
  rootPage: any;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleDefault();

      var securityToken = localStorage.getItem('securityToken');
      var isUserLoggedIn = localStorage.getItem('isUserLoggedIn');

      if ((securityToken == null || securityToken == 'null') &&
        (isUserLoggedIn == 'null' || isUserLoggedIn == null || isUserLoggedIn == 'false')) {
        this.rootPage = LoginPage;
      }
      else {
        this.rootPage = WelcomePage;
      }
    });
  }
}