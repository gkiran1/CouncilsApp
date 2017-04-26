import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, MenuController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { User } from '../../user/user';
import { Camera, Toast, File, FileChooser, FilePath, ImagePicker } from 'ionic-native';
import * as firebase from 'firebase';
import * as moment from 'moment';
declare var FilePicker;

@Component({
  templateUrl: 'new-council-file.html',
  selector: 'new-council-file-page'
})
export class NewCouncilFilePage {
  // @ViewChild('fileSelector') fileSelector;
  newCouncilFileForm: FormGroup;
  councils;
  guestPicture: any;
  imagePath: any;
  profilePictureRef: any;
  pictureRef: any;
  randomImage: any;
  filename: any;
  image = '';
  file: string;
  filedata: string;
  files = {
    $key: '',
    images: []
  }

  now = moment().valueOf();

  constructor(
    fb: FormBuilder,
    public appservice: AppService,
    public firebaseservice: FirebaseService,
    public nav: NavController,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public platform: Platform) {
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
    let loader = this.loadingCtrl.create({
      spinner: 'dots',
    });
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
      loader.present();
      this.guestPicture = imageData;
      this.imagePath = "data:image/jpeg;base64," + imageData;
      value.createdDate = moment().toISOString();
      value.councilid = value.council.$key;
      value.councilname = value.council.council;
      value.filename = 'Image' + '_' + this.now + '.png';
      value.filetype = (value.filename.substr(value.filename.lastIndexOf('.') + 1)).toUpperCase();
      this.firebaseservice.saveFile(value).then(fileId => {
        this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename)
          .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
          .then((savedPicture) => {
            this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
            this.pictureRef.then((metadata) => {
              loader.dismiss();
              // Metadata now contains the metadata like filesize and type for 'images/...'
              this.nav.push(OpenCouncilFilePage, {
                file: metadata, file1: fileId, value: value
              });
            }).catch((error) => {
              loader.dismiss();
              console.log(error);
            });
          }).catch(err => {
            loader.dismiss();
            console.log(err);
          })
      }).catch(err => {
        loader.dismiss();
        console.log(err);
      })
    }, error => {
      loader.dismiss();
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  // to upload a picture from gallery to the firebase.
  uploadPicture(value) {
    let loader = this.loadingCtrl.create({
      spinner: 'crescent',
      content: "Please wait while uploading...",
    });
    Camera.getPicture({
      quality: 95,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.PNG,
      targetWidth: 500,
      targetHeight: 500,
      mediaType: Camera.MediaType.PICTURE,
      saveToPhotoAlbum: true
    }).then(imageData => {
      loader.present();
      this.guestPicture = imageData;
      this.imagePath = "data:image/jpeg;base64," + imageData;
      value.createdDate = moment().toISOString();
      value.councilid = value.council.$key;
      value.councilname = value.council.council;
      value.filename = 'Image' + '_' + this.now + '.png';
      value.filetype = (value.filename.substr(value.filename.lastIndexOf('.') + 1)).toUpperCase();
      this.firebaseservice.saveFile(value).then(fileId => {
        this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename)
          .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
          .then((savedPicture) => {
            this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
            this.pictureRef.then((metadata) => {
              loader.dismiss();
              // Metadata now contains the metadata like filesize and type for 'images/...'
              this.nav.push(OpenCouncilFilePage, {
                file: metadata, file1: fileId, value: value
              });
            }).catch((error) => {
              loader.dismiss();
              console.log(error);
            });
          }).catch(err => {
            loader.dismiss();
            console.log(err);
          })
      }).catch(err => {
        loader.dismiss();
        console.log(err);
      })
    }, error => {
      loader.dismiss();
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  // to upload files from the device.
  importFile(value) {
    let loader = this.loadingCtrl.create({
      spinner: 'crescent',
      content: "Please wait while uploading...",
    });
    if (this.platform.is('ios')) {
      var options = ["public.data", "public.audio"];
      FilePicker.pickFile(
        function (uri) {
          // alert(uri);
          loader.present();
          this.uploadFile(uri, value, loader);
        },
        function (error) {
          loader.dismiss();
          // alert(error);
        }, options
      );
    }
    else {
      FileChooser.open()
        .then(uri => {
          loader.present();
          this.uploadFile(uri, value, loader);
        }).catch(error => {
          loader.dismiss();
          // alert(error)
          console.log(error);
        });
    }
  }
  uploadFile(uri, value, loader) {
    this.file = uri.toString();
    FilePath.resolveNativePath(this.file)
      .then(filePath => {
        (<any>window).resolveLocalFileSystemURL(filePath, (res) => {
          res.file((resFile) => {
            var reader = new FileReader();
            reader.readAsArrayBuffer(resFile);
            reader.onloadend = (evt: any) => {
              var imgBlob = new Blob([evt.target.result]);
              var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
              var filetype = (filename.substr(filename.lastIndexOf('.') + 1)).toUpperCase();
              // alert(filetype)
              var mimeType;
              switch (filetype) {
                case 'PNG':
                  mimeType = 'image/png';
                  break;
                case 'JPG':
                  mimeType = 'image/jpeg';
                  break;
                case 'DOC':
                  mimeType = 'application/msword';
                  break;
                case 'PDF':
                  mimeType = 'application/pdf';
                  break;
                case 'XLS':
                  mimeType = 'application/vnd.ms-excel';
                  break;
                default:
                  break;
              }
              value.createdDate = moment().toISOString();
              value.councilid = value.council.$key;
              value.councilname = value.council.council;
              value.filename = filename;
              value.filetype = filetype;
              // alert(mimeType);
              this.firebaseservice.saveFile(value).then(fileId => {
                this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename)
                  .put(imgBlob, { contentType: mimeType })
                  .then((savedPicture) => {
                    this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename).getMetadata();
                    this.pictureRef.then((metadata) => {
                      loader.dismiss();
                      // Metadata now contains the metadata like filesize and type for 'images/...'
                      this.nav.push(OpenCouncilFilePage, {
                        file: metadata, file1: fileId, value: value
                      });
                    }).catch((error) => {
                      loader.dismiss();
                      // alert(error);
                      console.log(error);
                    });
                  }).catch(error => {
                    loader.dismiss();
                    // alert(error);
                    console.log(error);
                  })
              }).catch(error => {
                loader.dismiss();
                // alert(error);
                console.log(error);
              })
            }
          })
        })
      }).catch(error => {
        loader.dismiss();
        // alert(error)
        console.log(error);
      });
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