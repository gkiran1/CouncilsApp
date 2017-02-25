import { Component,ViewChild  } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading ,NavParams } from 'ionic-angular';
import { RegisterPage } from '../register/register';
 import { AuthService } from '../../providers/auth-service';
 import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { CouncilLoginPage } from '../councillogin/councillogin';
import{FirebaseService} from '../../environments/firebase/firebase-service'
 import { AppService } from '../../providers/app-service';

@Component({
  selector: 'page-display',
  templateUrl: 'display.html'
})
export class DisplayPage {
  // @ViewChild(Nav) nav: Nav;
   //rootPage = CouncilLoginPage;

   //displaypage:DisplayPage;
   userName;
  registerCredentials = {email: '', ldsorgusername: ''};
  
  constructor(private navParams: NavParams, public appService:AppService) {
     this.registerCredentials.email = navParams.data.email;
     this.registerCredentials.ldsorgusername = navParams.data.ldsorgusername;
      // this.userName = this.appService.user.firstname;
      // console.log('constructor', this.userName);    
      // menu.enable(true);      
   }

   click(){
    // setTimeout(() => {
    //     this.userName = this.firebaseService.usr.firstname;
    //   },50000);
     // this.userName = this.appService.user.firstname;
      // console.log('click', this.userName);
   }

    // openMenu() {
    //   this.menu.open();
    // }
   
}
