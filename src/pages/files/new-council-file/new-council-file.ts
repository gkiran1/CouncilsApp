import { Component } from '@angular/core';
import { Nav, NavController, AlertController, ActionSheetController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
// import { ChangePasswordPage } from '../edit-profile/change-password';
import { User } from '../../user/user';
import { Toast } from 'ionic-native';
import { Camera } from 'ionic-native';
import * as firebase from 'firebase';
import * as moment from 'moment';

@Component({
  templateUrl: 'new-council-file.html',
  selector: 'new-council-file-page'
})
export class NewCouncilFilePage {
  newCouncilFileForm: FormGroup;
  councils;
  guestPicture: any;
  imagePath: any;
  profilePictureRef: any;
  image = '';
  files = {
    $key: '',
    images: []
  }
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
      this.profilePictureRef = firebase.storage().ref('/users/');
      this.councils = [];
      user.councils.forEach(c => {
        this.councils.push(this.firebaseservice.getCouncilByCouncilKey(c));
      });
      this.newCouncilFileForm = fb.group({
        council: ['', Validators.required],
        createdDate: '',
        createdBy: appservice.uid,
        createdUser: user.firstname + ' ' + user.lastname,
        isActive: true,
        images: [],
        councilname: ''
      });
    });
  }

  chooseFileActionsPage(value) {
    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: [
        {
          text: 'Take Photo',
          cssClass: "actionsheet-items",
          handler: () => {
            this.takePicture(value);
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
            this.uploadPicture(value);
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
  // to upload a picture to the firebase.
  takePicture(value) {
    Camera.getPicture({
      quality: 95,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.PNG,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: true
    }).then(imageData => {
      // alert('image data' + imageData);
      this.guestPicture = imageData;
      this.imagePath = "data:image/jpeg;base64," + imageData;
      // this.showAlert('success',this.imagePath);
      value.createdDate = moment().toISOString();
      console.log('date:' + value.createdDate);
      value.councilid = value.council.$key;
      console.log('councilId:' + value.councilid);
      value.councilname = value.council.council;
      console.log('councilname:' + value.councilname);
      this.profilePictureRef.child('profilePicture.png')
        .putString(this.guestPicture, 'base64', { contentType: 'image/png' })
        .then((savedPicture) => {
          console.log('savedPicture:' + savedPicture.downloadURL);
          this.firebaseservice.saveFile(value, savedPicture.downloadURL).then(fileId => {
            console.log("file created successfully...", fileId);
            this.nav.push(OpenCouncilFilePage, {
              file: fileId
            });
          })
            .catch(err => {
              console.log(err);
              alert(err);
            })
        });
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  // to upload a picture from gallery to the firebase.
  uploadPicture(value) {
    Camera.getPicture({
      quality: 95,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.PNG,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    }).then(imageData => {
      // alert('image data' + imageData);
      this.guestPicture = imageData;
      this.imagePath = "data:image/jpeg;base64," + imageData;
      // this.showAlert('success',this.imagePath);
      value.createdDate = moment().toISOString();
      console.log('date:' + value.createdDate);
      value.councilid = value.council.$key;
      console.log('councilId:' + value.councilid);
      value.councilname = value.council.council;
      console.log('councilname:' + value.councilname);
      this.profilePictureRef.child('profilePicture.png')
        .putString(this.guestPicture, 'base64', { contentType: 'image/png' })
        .then((savedPicture) => {
          console.log('savedPicture:' + savedPicture.downloadURL);
          this.firebaseservice.saveFile(value, savedPicture.downloadURL).then(fileId => {
            console.log("file created successfully...", fileId);
            this.nav.push(OpenCouncilFilePage, {
              file: fileId
            });
          })
            .catch(err => {
              console.log(err);
              alert(err);
            })
        });
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  cancel() {
    this.nav.pop();
  }

}