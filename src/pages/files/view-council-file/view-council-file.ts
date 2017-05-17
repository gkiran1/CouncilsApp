import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, NavParams, Platform, LoadingController, ActionSheetController, MenuController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { Transfer, File, Camera, FileChooser, FilePath } from 'ionic-native';
import * as firebase from 'firebase';
import { AppService } from '../../../providers/app-service';
import * as moment from 'moment';

declare var FileTransfer;
declare var FilePicker;

@Component({
    templateUrl: 'view-council-file.html',
    selector: 'view-council-file-page'
})
export class ViewCouncilFilePage {
    count$ = new Subject();
    file = {
        $key: '',
        councilid: '',
        name: '',
        type: '',
        size: ''
    }
    //files
    file1 = {
        $key: '',
        councilid: ''
    }
    filesArray = [];
    deleteflag = false;
    value: any;
    listdisplayflag = false;
    addfileflag = false;
    filepath1: string;
    guestPicture: any;
    imagePath: any;
    profilePictureRef: any;
    pictureRef: any;
    councilId: any;
    councilName: any;
    createdUser: string;
    now = moment().valueOf();
    device: string;
    constructor(
        public fs: FirebaseService,
        public appservice: AppService,
        public nav: NavController,
        public navparams: NavParams,
        public loadingCtrl: LoadingController,
        public menuctrl: MenuController,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public platform: Platform) {

        this.filesArray = [];
        this.profilePictureRef = firebase.storage().ref('/files/');
        this.councilId = navparams.get('councilid')
        this.councilName = navparams.get('councilname');
        platform.ready().then(() => {
            if (this.platform.is('ios')) {
                this.device = "ios";
            }
            else {
                this.device = "android";
            }

        });
        appservice.getUser().subscribe(user => {
            this.createdUser = user.firstname + ' ' + user.lastname;
        });

        fs.getFilesByCouncil(this.councilId).subscribe(files => {
            this.filesArray.push(...files);
        });

    }
    downloadFile(item) {
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        if (this.device !== undefined && this.device !== 'android') {

            var targetPath = cordova.file.documentsDirectory + '/CouncilDownloads/' + item.filename;
            alert(targetPath);

        } else {
            var targetPath = cordova.file.cacheDirectory + '/CouncilDownloads/' + item.filename;
        }
        let ProfileRef = this.profilePictureRef.child(item.councilid + '//' + item.$key + '//' + item.filename)
        var filetype = (item.filename.substr(item.filename.lastIndexOf('.') + 1)).toUpperCase();
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
        let fileTransfer = new FileTransfer();
        ProfileRef.getDownloadURL().then((url) => {
            var trustHosts = true;
            fileTransfer.download(url, targetPath, function (res) {
                loader.dismiss();
                cordova.plugins.fileOpener2.open(
                    targetPath,
                    mimeType,
                    {
                        error: function (e) {
                            loader.dismiss();
                            console.log(e);
                            alert('Error status: ' + e.status + ' - Error message: ' + e.message);
                        },
                        success: function () {
                            loader.dismiss();
                            console.log('file opened successfully.');
                        }
                    }
                );
            }, function (e) {
                loader.dismiss();
                alert('Target path:' + targetPath + JSON.stringify(e));
            })

        }).catch((error) => {
            loader.dismiss();
            console.log(error);
        });

    }

    back() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });

    }

    addFileActionsPage(value) {
        let actionSheet = this.actionSheetCtrl.create({
            title: '',
            buttons: [
                {
                    text: 'Take Photo',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.addfileflag = true;
                        this.takePicture(this.value);
                        this.menuctrl.close();
                    }
                },
                {
                    text: 'Choose From Library',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.addfileflag = true;
                        this.uploadPicture(this.value);
                        this.menuctrl.close();
                    }
                },
                {
                    text: 'Import File From...',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.addfileflag = true;
                        this.importFile(this.value);
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

    fileSize(base64Img) {
    var str = atob(base64Img); 
    return str.length; 
  }

    takePicture(value) {
        // this.isNewCouncilFileflag = true;
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
            this.value.createdDate = moment().toISOString();
            this.value.councilid = value.council.$key;
            this.value.councilname = value.council.council;
            this.value.createdUser = this.createdUser;
            this.value.filesize = this.fileSize(this.imagePath);
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
                            this.file = metadata;
                            this.file.size = this.formatBytes(this.file.size);
                            this.file.$key = fileId;
                            this.file.name = value.filename;
                            this.file.type = value.filetype;
                            this.filesArray.push(this.file);
                            this.value.councilname = value.councilname;
                            this.value.filename = value.filename;
                            this.value.filetype = value.filetype;
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

        loader.dismiss();
    }
    // to upload a picture from gallery to the firebase.
    uploadPicture(value) {
        // this.isNewCouncilFileflag = true;
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
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
            this.value.createdDate = moment().toISOString();
            this.value.councilid = value.council.$key;
            this.value.councilname = value.council.council;
            this.value.createdUser = this.createdUser;
            this.value.filesize = this.fileSize(this.imagePath);
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
                            this.file = metadata;
                            this.file.size = this.formatBytes(this.file.size);
                            this.file.$key = fileId;
                            this.file.name = value.filename;
                            this.file.type = value.filetype;
                            this.filesArray.push(this.file);
                            this.value.councilname = value.councilname;
                            this.value.filename = value.filename;
                            this.value.filetype = value.filetype;
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

        loader.dismiss();

    }
    // to upload files from the device.
   
  importFile(value) {
    let loader = this.loadingCtrl.create({
      spinner:'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
    });
    if (!this.platform.is('android')) {
      // var options = ["public.data", "public.audio"];
      FilePicker.pickFile(
         (uri) =>{
          // alert(uri);
           loader.present();
          this.uploadFile(uri, value, loader);
        },
        function (error) {
          loader.dismiss();
          // alert(error);
        });
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
    // FilePath.resolveNativePath(this.file)
    //   .then(filePath => {
      let filePath = 'file:/'+this.file;
      //alert('1:'+ filePath);
        (<any>window).resolveLocalFileSystemURL(filePath, (res) => {
          //alert('2:'+ JSON.stringify(res));
          res.file((resFile) => {
            //alert('3:'+ JSON.stringify(resFile));
            var reader = new FileReader();
            let newfile = new File();
            File.readAsArrayBuffer(resFile, 'newimage')
            .then(res=>{
              //alert('res'+JSON.stringify(res));
            })
            .catch(err=>{
             // alert(JSON.stringify(err));
            })
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
              value.createdUser = this.createdUser;
              value.createdDate = moment().toISOString();
              value.councilid = value.council.$key;
              value.councilname = value.council.council;
              value.filename = filename;
              value.filetype = filetype;
              value.filesize = imgBlob.size;
              // alert(mimeType);
              this.firebaseservice.saveFile(value).then(fileId => {
                this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename)
                  .put(imgBlob, { contentType: mimeType })
                  .then((savedPicture) => {
                    this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename).getMetadata();
                    this.pictureRef.then((metadata) => {
                      loader.dismiss();
                      //isNewCouncilFileflag=false
                      // Metadata now contains the metadata like filesize and type for 'images/...'
                      this.nav.push(ViewCouncilFilePage, {
                        councilid: value.councilid, councilname: value.councilname },{ animate: true, animation: 'transition', direction: 'forward'
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
      // }).catch(error => {
      //   loader.dismiss();
      //   // alert(error)
      //   console.log(error);
      // });
  }
    // to convert bytes to KB/MB/GB/TB formats
    formatBytes(bytes) {
        // this.isNewCouncilFileflag = true;
        if (bytes < 1024) return bytes + "b";
        else if (bytes < 1048576) return Math.round(bytes / 1024) + "kb";
        else if (bytes < 1073741824) return Math.round(bytes / 1048576) + "mb";
        else if (bytes < 1099511627776) return Math.round(bytes / 1073741824) + "gb";
        else return Math.round(bytes / 1099511627776) + "tb";
    }

    edit() {
        this.deleteflag = true;
    }
    done() {
        this.deleteflag = false;
    }

    delete(file) {
        // this.isNewCouncilFileflag = true;
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        //to delete files form the database using key
        this.firebaseservice.deleteFilesByKey(file.$key).then((res) => {
            //to delete files from the storage using file name
            this.profilePictureRef.child(this.councilId + '//' + file.$key + '//' + (file.name || file.filename)).delete().then(res => {
                this.filesArray.forEach((f, i) => {
                    if (f.$key == file.$key) {
                        loader.dismiss();
                        this.filesArray.splice(i, 1);
                        console.log(this.filesArray);
                    }
                })
                loader.dismiss();
            }).catch((error) => {
                loader.dismiss();
                console.log(error);
            });
        }).catch((err) => {
            loader.dismiss();
            console.log(err);
        });
    }
    deleteFiles(filesArray) {
        console.log('filesArray:' + filesArray);
        // this.isNewCouncilFileflag = true;
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        this.filesArray.forEach((f, i) => {
            //to delete all the files in the array
            this.firebaseservice.deleteFilesByKey(filesArray[i].$key).then(res => {
                this.profilePictureRef.child(this.councilId + '//' + filesArray[i].$key + '//' + (this.filesArray[i].name || this.filesArray[i].filename)).delete().then(res => {
                    loader.dismiss();
                    this.filesArray.splice(0, this.filesArray.length);
                }).catch(err => {
                    loader.dismiss();
                    console.log(err);
                })
            }).catch(err => {
                loader.dismiss();
                console.log(err);
            })

        })
    }
}
