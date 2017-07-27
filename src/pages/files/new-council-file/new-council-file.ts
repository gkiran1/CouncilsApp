import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, MenuController, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { ViewCouncilFilePage } from '../view-council-file/view-council-file';
import { User } from '../../user/user';
import { Camera, Toast, File, ImagePicker } from 'ionic-native';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import * as firebase from 'firebase';

import { AngularFire } from 'angularfire2';
import { Subscription } from 'rxjs';

import * as moment from 'moment';

import { AndroidPermissions } from '@ionic-native/android-permissions';
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
  createdUser: string;
  isNewCouncilFileflag = true;
  now = moment().valueOf();
  userSubscription: Subscription;

  areaCouncils = []
  stakeCouncils = [];
  wardCouncils = [];
  addedCouncils = [];

  firstShown;

  constructor(
    fb: FormBuilder,
    public appservice: AppService,
    public firebaseservice: FirebaseService,
    public nav: NavController,
    public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public af: AngularFire,
    public platform: Platform,
    public filechooser: FileChooser,
    public filePath: FilePath,
    public androidPermissions: AndroidPermissions) {

    // this.platform.ready().then(() => {
    //   alert(this.platform.platforms());
    // });
    appservice.getUser().subscribe(user => {
      //console.log(user);
      this.profilePictureRef = firebase.storage().ref('/files/');
      this.councils = [];
      var unitType = localStorage.getItem('unitType');

      user.councils.forEach(c => {

        this.firebaseservice.getCouncilByCouncilKey(c).subscribe(council => {
          if (unitType === 'Area') {
            if (council['under'] === 'Added') {
              this.addedCouncils.push(council);
            }
            else if (council['council'] === 'Stake Presidents') {
              this.stakeCouncils.push(council);
            }
            else {
              this.areaCouncils.push(council);
            }
          }
          else if (unitType === 'Stake') {
            if (council['under'] === 'Added') {
              this.addedCouncils.push(council);
            }
            else if (council['council'] === 'Stake Presidents') {
              this.areaCouncils.push(council);
            }
            else if (council['council'] === 'Bishops') {
              this.wardCouncils.push(council);
            }
            else {
              this.stakeCouncils.push(council);
            }
          }
          else if (unitType === 'Ward') {
            if (council['under'] === 'Added') {
              this.addedCouncils.push(council);
            }
            else if (council['council'] === 'Bishops') {
              this.stakeCouncils.push(council);
            }
            else {
              this.wardCouncils.push(council);
            }
          }

          if (this.areaCouncils.length > 0) {
            this.firstShown = 'Area';
          }
          else if (this.stakeCouncils.length > 0) {
            this.firstShown = 'Stake';
          }
          else if (this.wardCouncils.length > 0) {
            this.firstShown = 'Ward';
          }
          else if (this.addedCouncils.length > 0) {
            this.firstShown = 'Added';
          }

        });
        //this.councils.push(this.firebaseservice.getCouncilByCouncilKey(c));
      });
      this.createdUser = user.firstname + ' ' + user.lastname;
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
          role: 'cancel',
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
      spinner: 'hide',
      content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
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
      value.filesize = this.fileSize(imageData);
      value.createdDate = moment().toISOString();
      value.createdUser = this.createdUser;
      value.councilid = value.council.$key;
      value.councilname = value.council.council;
      value.filename = 'IMG' + moment().valueOf() + '.png';
      value.filetype = (value.filename.substr(value.filename.lastIndexOf('.') + 1)).toUpperCase();
      this.firebaseservice.saveFile(value).then(fileId => {
        this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename)
          .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
          .then((savedPicture) => {
            //this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
            //this.pictureRef.then((metadata) => {
            loader.dismiss();
            // Metadata now contains the metadata like filesize and type for 'images/...'
            //isNewCouncilFileflag=false
            this.nav.push(ViewCouncilFilePage, {
              councilid: value.councilid, councilname: value.councilname
            }, { animate: true, animation: 'transition', direction: 'forward' });
            // }).catch((error) => {
            //   loader.dismiss();
            //   console.log(error);
            // });
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
      spinner: 'hide',
      content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
    });
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
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
          value.createdUser = this.createdUser;
          value.filesize = this.fileSize(imageData);
          value.councilid = value.council.$key;
          value.councilname = value.council.council;
          value.filename = 'IMG' + moment().valueOf() + '.png';
          value.filetype = (value.filename.substr(value.filename.lastIndexOf('.') + 1)).toUpperCase();
          this.firebaseservice.saveFile(value).then(fileId => {
            this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename)
              .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
              .then((savedPicture) => {
                //this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
                // this.pictureRef.then((metadata) => {
                loader.dismiss();
                //isNewCouncilFileflag=false
                // Metadata now contains the metadata like filesize and type for 'images/...'
                this.nav.push(ViewCouncilFilePage, {
                  councilid: value.councilid, councilname: value.councilname
                }, {
                    animate: true, animation: 'transition', direction: 'forward'
                  });
                // }).catch((error) => {
                //   loader.dismiss();
                //   console.log(error);
                // });
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
    });
  }

  fileSize(base64Img) {
    //alert(base64Img);
    var str = atob(base64Img);
    //alert(str);
    //alert(str.length);
    return str.length;
  }

  // to upload files from the device.
  importFile(value) {
    let loader = this.loadingCtrl.create({
      spinner: 'hide',
      content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
    });
    if (this.platform.is('ios')) {
      //alert('if');
      // var options = ["public.data", "public.audio"];
      FilePicker.pickFile(
        (uri) => {
          //alert(uri);
          loader.present();
          this.uploadFile(uri, value, loader);
        },
        function (error) {
          loader.dismiss();
          //alert(error);
        });
    }
    else {
      // alert('else');
      this.filechooser.open()
        .then(uri => {
          //loader.present();
          this.uploadFile(uri, value, loader);
        }).catch(error => {
          loader.dismiss();
          //alert(error)
          console.log(error);
        });
    }
  }
  //const fileTransfer: TransferObject = this.transfer.create();
  uploadInputFile($event) {
    this.readFile($event.target);

  }

  readFile(inputFile) {
    let fileEntry = inputFile.files[0];
    //alert(inputFile.value);
    (<any>window).resolveLocalFileSystemURL(inputFile.value, this.gotFile, this.fail);



  }

  fail() {
    alert('File failed');
  }

  gotFile(fileEntry) {
    //alert('file reading');
    fileEntry.file(function (file) {
      //alert('file true');
      let reader = new FileReader();
      reader.onloadend = function (e) {
        console.log("Text :" + this.result);
      }
      reader.readAsText(file);
    });
  }

    uploadFile(uri, value, loader) {
    //loader.dismiss();
    this.file = uri.toString();

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      success => {
        console.log('Camera granted');
      },
      err => this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.CAMERA)
    );
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
      success => {
        console.log('External Storage granted');
      },
      err => this.androidPermissions.requestPermissions(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
    );

    (<any>window).FilePath.resolveNativePath(uri, (filePath) => {

      //let filePath = 'file://'+this.file;
      //alert('1:'+ filePath);
      (<any>window).resolveLocalFileSystemURL(filePath, (res) => {
        //alert('2:'+ res);
        res.file((resFile) => {
          //alert('3:'+ JSON.stringify(resFile));
          var reader = new FileReader();
          //let newfile = new File();
          // File.readAsArrayBuffer(res, 'newimage')
          // .then(resN=>{
          //   //alert('res'+JSON.stringify(res));
          // })
          // .catch(err=>{
          //   alert('err file reader'+err);
          //   //alert(JSON.stringify(err));
          // });
          //  setTimeout(() => {
          //   alert('timeout tirgger');

          // },3000);
          reader.readAsArrayBuffer(resFile);


          reader.onloadend = (evt: any) => {
            var imgBlob = new Blob([evt.target.result]);
            //alert(imgBlob);
            //alert(imgBlob.size);
            var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
            var filetype = (filename.substr(filename.lastIndexOf('.') + 1)).toUpperCase();
            //alert(filetype)
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
              case 'DOCX':
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
              case 'PDF':
                mimeType = 'application/pdf';
                break;
              case 'XLS':
                mimeType = 'application/vnd.ms-excel';
                break;
              case 'XLSX':
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;

              default:
                break;
            }
            value.createdUser = this.createdUser;
            value.createdDate = moment().toISOString();
            value.councilid = value.council.$key;
            value.councilname = value.council.council;
            value.filename = filename;
            value.filetype = filetype;
            value.filesize = imgBlob.size;
            ////alert(mimeType);
            this.firebaseservice.saveFile(value).then(fileId => {
              this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename)
                .put(imgBlob, { contentType: mimeType })
                .then((savedPicture) => {
                  //alert('file saved');
                  //this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename).getMetadata();
                  //this.pictureRef.then((metadata) => {
                  loader.dismiss();
                  //isNewCouncilFileflag=false
                  // Metadata now contains the metadata like filesize and type for 'images/...'
                  this.nav.push(ViewCouncilFilePage, {
                    councilid: value.councilid, councilname: value.councilname
                  }, {
                    animate: true, animation: 'transition', direction: 'forward'
                    });

                }).catch(error => {
                  loader.dismiss();
                  //alert(error);
                  console.log(error);
                })
            }).catch(error => {
              loader.dismiss();
              //alert(error);
              console.log(error);
            })
          }
        })
      })
      // .catch(err => {
      //   alert(err);
      //   loader.dismiss();
      //   console.log(err);
      // })
    }, (error) => {
      loader.dismiss();
      //alert(error)
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