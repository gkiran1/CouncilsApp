import { Component } from '@angular/core';
import { Nav, NavController, AlertController, ActionSheetController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { User } from '../../user/user';
import { Camera, Toast, File, FileChooser, FilePath } from 'ionic-native';
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
  pictureRef: any;
  filename: any;
  image = '';
  file: string;
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
      this.profilePictureRef = firebase.storage().ref('/files/');
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
            this.importFile(value);
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
      mediaType: Camera.MediaType.PICTURE,
      saveToPhotoAlbum: true
    }).then(imageData => {
      this.guestPicture = imageData;
      this.imagePath = "data:image/jpeg;base64," + imageData;
      value.createdDate = moment().toISOString();
      value.councilid = value.council.$key;
      value.councilname = value.council.council;
      this.profilePictureRef.child('/images/' + value.councilid)
        .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
        .then((savedPicture) => {
          this.firebaseservice.saveFile(value, savedPicture.downloadURL).then(fileId => {
            this.pictureRef = this.profilePictureRef.child('/images/' + value.councilid).getMetadata();
            this.pictureRef.then((metadata) => {
              // Metadata now contains the metadata like filesize and type for 'images/...'
              this.nav.push(OpenCouncilFilePage, {
                file: metadata, file1: fileId, value: value.councilname
              });
            }).catch((error) => {
              console.log(error);
            });
          }).catch(err => {
            console.log(err);
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
      mediaType: Camera.MediaType.PICTURE,
      saveToPhotoAlbum: false
    }).then(imageData => {
      this.guestPicture = imageData;
      this.imagePath = "data:image/jpeg;base64," + imageData;
      value.createdDate = moment().toISOString();
      value.councilid = value.council.$key;
      value.councilname = value.council.council;
      this.profilePictureRef.child('/images/' + value.councilid)
        .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
        .then((savedPicture) => {
          this.firebaseservice.saveFile(value, savedPicture.downloadURL).then(fileId => {
            this.pictureRef = this.profilePictureRef.child('/images/' + value.councilid).getMetadata();
            this.pictureRef.then((metadata) => {
              // Metadata now contains the metadata like filesize and type for 'images/...'
              this.nav.push(OpenCouncilFilePage, {
                file: metadata, file1: fileId, value: value.councilname
              });
            }).catch((error) => {
              console.log(error);
            });
          }).catch(err => {
            console.log(err);
          })
        });
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  importFile(value) {
    FileChooser.open()
      .then(uri => {
        this.file = uri.toString();        
        FilePath.resolveNativePath(this.file)
          .then(filePath => {
            value.createdDate = moment().toISOString();
            value.councilid = value.council.$key;
            value.councilname = value.council.council;
            this.profilePictureRef.child('/images/' + value.councilid)
              .putString(filePath)
              .then((savedPicture) => {
                this.firebaseservice.saveFile(value, filePath).then(fileId => {                  
                  this.pictureRef = this.profilePictureRef.child('/images/' + value.councilid).getMetadata();
                  this.pictureRef.then((metadata) => {                    
                    // Metadata now contains the metadata like filesize and type for 'images/...'
                    this.nav.push(OpenCouncilFilePage, {
                      file: metadata, file1: fileId
                    });
                  }).catch((error) => {
                    alert(error);
                  });
                }).catch(err => {
                  alert(err);
                })
              }).catch(err => {
                alert(err);
              })
          }).catch(e => alert(e));
      }).catch(e => alert(e));
  }

  cancel() {
    this.nav.pop();
  }
  showAlert(reason, text) {
    let alert = this.alertCtrl.create({
      title: '',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }

}