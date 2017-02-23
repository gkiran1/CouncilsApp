import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { DisplayPage } from '../pages/display/display';
import { CouncilLoginPage } from '../pages/councillogin/councillogin';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { WelcomePage } from '../pages/welcome/welcome';
import { InviteMemberPage } from '../pages/invite/invite';
import { NewAssignmentPage } from '../pages/new-assignment/new-assignment';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage = InviteMemberPage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
    });
  }
}