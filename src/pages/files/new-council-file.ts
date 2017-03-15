import { Component } from '@angular/core';
import { Nav, NavController, AlertController, ActionSheetController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { WelcomePage } from '../menu/menu';
import { User } from '../../user/user';
import { Toast } from 'ionic-native';
import { Camera } from 'ionic-native';
import * as firebase from 'firebase';

@Component({
  templateUrl: 'new-council-file.html',
  selector: 'new-council-file-page'
})
export class NewCouncilFilePage {
  newCouncilFileForm: FormGroup;
  councils;
  constructor(
    fb: FormBuilder,
    public appservice: AppService,
    public firebaseservice: FirebaseService,
    public nav: NavController,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public alertCtrl: AlertController) {
    appservice.getUser().subscribe(user => {
      //console.log(user);
      this.councils = [];
      user.councils.forEach(c => {
        this.councils.push(this.firebaseservice.getCouncilByCouncilKey(c));
      });
      this.newCouncilFileForm = fb.group({
        council: ['', Validators.required]
        // createdDate: '',
        // createdBy: appservice.uid,
        // createdUser: user.firstname + ' ' + user.lastname,
        // isActive: true,
        // messages: [],
        // councilname: ''
      });
    });
  }

  chooseFileActionsPage() {
    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: [
        {
          text: 'Take Photo',          
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();            
          }
        },
        {
          text: 'Use Last Photo Taken',          
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();            
          }
        },
        {
          text: 'Choose From Library',          
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();            
          }
        },
        {
          text: 'Import File From...',          
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();            
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
  cancel() {
    this.nav.pop();
  }

}