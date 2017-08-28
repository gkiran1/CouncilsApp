import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, NavParams, Platform, ActionSheetController, MenuController, LoadingController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { Transfer, File, Camera, ImagePicker } from 'ionic-native';
import * as firebase from 'firebase';
import { AppService } from '../../../providers/app-service';
import * as moment from 'moment';

import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';

import { AndroidPermissions } from '@ionic-native/android-permissions';
import { NgZone } from '@angular/core';

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
        size: '',

    }

    newFile = {
        filename: '',
        filetype: '',
        createdUser: '',
        filesize: 0,
        councilid: '',
        councilname: '',
        createdBy: '',
        createdDate: '',
        isActive: true,
    }

    importedFilePath: string;
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
    createdBy: string;
    newCouncilFileForm: FormGroup;

    now = moment().valueOf();
    device: string;
    constructor(
        fb: FormBuilder,
        public fs: FirebaseService,
        public appservice: AppService,
        public nav: NavController,
        public navparams: NavParams,
        public menuctrl: MenuController,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public platform: Platform,
        public filechooser: FileChooser,
        public filePath: FilePath,
        public androidPermissions: AndroidPermissions,
        public loadingCtrl: LoadingController,
        private zone: NgZone) {

        this.filesArray = [];
        this.profilePictureRef = firebase.storage().ref('/files/');
        this.councilId = navparams.get('councilid');
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
            this.createdBy = user.$key;
            //console.log(this.createdUser);
        });

        this.newCouncilFileForm = fb.group({
            council: ['', Validators.required],
            councilid: this.councilId,
            createdDate: '',
            createdBy: appservice.uid,
            createdUser: this.createdUser,
            isActive: true,
            images: [],
            councilname: ''
        });

        this.bindFilesList();

    }

    bindFilesList() {
        this.fs.getFilesByCouncil(this.councilId).subscribe(files => {
            this.filesArray = [];
            this.filesArray.push(...files);
            //alert(this.filesArray);
            // this.filesArray.reverse();
            this.filesArray.sort(function (a, b) {
                return (a.createdDate > b.createdDate) ? -1 : ((a.createdDate < b.createdDate) ? 1 : 0);
            });

        });
    }
    downloadFile(item) {
        let loader = this.loadingCtrl.create({
            spinner: 'ios'
        });
        loader.present();
        if (this.device !== undefined && this.device !== 'android') {

            var targetPath = cordova.file.documentsDirectory + '/CouncilDownloads/' + item.filename;
            //alert(targetPath);

        } else {
            var targetPath = cordova.file.externalDataDirectory + '/CouncilDownloads/' + item.filename;
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
                            //alert('Error status: ' + e.status + ' - Error message: ' + e.message);
                        },
                        success: function () {
                            loader.dismiss();
                            console.log('file opened successfully.');
                        }
                    }
                );
            }, function (e) {
                loader.dismiss();
                //alert('Target path:' + targetPath + JSON.stringify(e));
            })

        }).catch((error) => {
            loader.dismiss();
            console.log(error);
        });

    }

    back() {
        if (this.nav.getPrevious().name === 'NewCouncilFilePage') {
            this.nav.popToRoot();
        }
        else {
            this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
        }
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
                        this.takePicture(value);
                        this.menuctrl.close();
                    }
                },
                {
                    text: 'Choose From Library',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.addfileflag = true;
                        this.uploadPicture(value);
                        this.menuctrl.close();
                    }
                },
                {
                    text: 'Import File From...',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.addfileflag = true;
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

    fileSize(base64Img) {
        var str = atob(base64Img);
        return str.length;
    }

    takePicture(value) {
        // this.isNewCouncilFileflag = true;
        let loader = this.loadingCtrl.create({
            spinner: 'ios'
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
            this.newFile.createdBy = this.createdBy;
            this.newFile.createdDate = moment().toISOString();
            this.newFile.councilid = this.councilId;
            this.newFile.councilname = this.councilName;
            this.newFile.createdUser = this.createdUser;
            this.newFile.filesize = this.fileSize(imageData);
            this.newFile.filename = 'IMG' + moment().valueOf() + '.png';
            this.newFile.filetype = (this.newFile.filename.substr(this.newFile.filename.lastIndexOf('.') + 1)).toUpperCase();
            this.firebaseservice.saveFile(this.newFile).then(fileId => {
                this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + this.newFile.filename)
                    .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
                    .then((savedPicture) => {
                        // this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
                        // this.pictureRef.then((metadata) => {
                        this.bindFilesList();
                        loader.dismiss();
                        // Metadata now contains the metadata like filesize and type for 'images/...'
                        //     this.file = metadata;
                        //     this.file.size = this.formatBytes(this.file.size);
                        //     this.file.$key = fileId;
                        //     this.file.name = value.filename;
                        //     this.file.type = value.filetype;
                        //     this.filesArray.push(this.file);
                        //     this.value.councilname = value.councilname;
                        //     this.value.filename = value.filename;
                        //     this.value.filetype = value.filetype;
                        // }).catch((error) => {
                        //     loader.dismiss();
                        //     console.log(error);
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

        loader.dismiss();
    }
    // to upload a picture from gallery to the firebase.
    uploadPicture(value) {
        // this.isNewCouncilFileflag = true;
        let loader = this.loadingCtrl.create({
            spinner: 'ios'
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
            this.newFile.createdDate = moment().toISOString();
            this.newFile.councilid = this.councilId;
            this.newFile.councilname = this.councilName;
            this.newFile.createdUser = this.createdUser;
            this.newFile.createdBy = this.createdBy;
            this.newFile.filesize = this.fileSize(imageData);
            this.newFile.filename = 'IMG' + moment().valueOf() + '.png';
            this.newFile.filetype = (this.newFile.filename.substr(this.newFile.filename.lastIndexOf('.') + 1)).toUpperCase();
            this.firebaseservice.saveFile(this.newFile).then(fileId => {
                this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + this.newFile.filename)
                    .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
                    .then((savedPicture) => {
                        // this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
                        // this.pictureRef.then((metadata) => {
                        this.bindFilesList();
                        loader.dismiss();
                        // Metadata now contains the metadata like filesize and type for 'images/...'
                        // this.file = metadata;
                        // this.file.size = this.formatBytes(this.file.size);
                        // this.file.$key = fileId;
                        // this.file.name = value.filename;
                        // this.file.type = value.filetype;
                        // this.filesArray.push(this.file);
                        // this.value.councilname = value.councilname;
                        // this.value.filename = value.filename;
                        //     // this.value.filetype = value.filetype;
                        // }).catch((error) => {
                        //     loader.dismiss();
                        //     console.log(error);
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

        loader.dismiss();

    }
    // to upload files from the device.

    importFile(value) {
        let loader = this.loadingCtrl.create({
            spinner: 'ios'
        });
      
        if (this.platform.is('ios')) {
            // var options = ["public.data", "public.audio"];
            FilePicker.pickFile(
                (uri) => {
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
            this.filechooser.open()
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
        this.importedFilePath = uri.toString();
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
        //alert(this.importedFilePath);
        (<any>window).FilePath.resolveNativePath(uri, (filePath) => {
            //let filePath = 'file://' + this.importedFilePath;
            //alert('1:'+ filePath);
            (<any>window).resolveLocalFileSystemURL(filePath, (res) => {
                //alert('2:'+ JSON.stringify(res));
                res.file((resFile) => {
                    //alert('3:'+ JSON.stringify(resFile));
                    var reader = new FileReader();
                    let newfile = new File();
                    // File.readAsArrayBuffer(resFile, 'newimage')
                    //     .then(res => {
                    //         //alert('res'+JSON.stringify(res));
                    //     })
                    //     .catch(err => {
                    //          //alert(err);
                    //     })
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
                        //alert(this.createdUser);
                        //alert(this.councilId);
                        //alert(this.councilName);
                        //alert(this.createdBy);
                        this.newFile.createdUser = this.createdUser;
                        this.newFile.createdDate = moment().toISOString();
                        this.newFile.councilid = this.councilId;
                        this.newFile.councilname = this.councilName;
                        this.newFile.filename = filename;
                        this.newFile.filetype = filetype;
                        this.newFile.filesize = imgBlob.size;
                        this.newFile.createdBy = this.createdBy;
                        this.newFile.isActive = true;
                        //alert(JSON.stringify(this.newFile));
                        this.firebaseservice.saveFile(this.newFile).then(fileId => {
                            //alert('meta data saved'+fileId);
                            this.profilePictureRef.child(this.councilId + '//' + fileId + '//' + filename)
                                .put(imgBlob, { contentType: mimeType })
                                .then((savedPicture) => {
                                    //alert('file saved');
                                    // this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename).getMetadata();
                                    // this.pictureRef.then((metadata) => {
                                    this.bindFilesList();
                                    loader.dismiss();
                                    //isNewCouncilFileflag=false
                                    // Metadata now contains the metadata like filesize and type for 'images/...'
                                    // this.nav.push(ViewCouncilFilePage, {
                                    //     councilid: value.councilid, councilname: value.councilname
                                    // }, {
                                    //         animate: true, animation: 'transition', direction: 'forward'
                                    //     });
                                    // }).catch((error) => {
                                    //     loader.dismiss();
                                    //      alert(error);
                                    //     console.log(error);
                                    // });
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
            spinner: 'ios'
        });
        loader.present();


        //to delete files form the database using key
        this.firebaseservice.deleteFilesByKey(file.$key).then((res) => {
            //to delete files from the storage using file name
            this.profilePictureRef.child(this.councilId + '//' + file.$key + '//' + (file.name || file.filename)).delete().then(res => {
                this.filesArray.forEach((f, i) => {
                    if (f.$key == file.$key) {
                        loader.dismiss();
                        this.zone.run(() => {
                            this.filesArray.splice(i, 1);
                        });
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
            spinner: 'ios'
        });
        loader.present();
        this.filesArray.forEach((f, i) => {
            //to delete all the files in the array
            this.firebaseservice.deleteFilesByKey(filesArray[i].$key).then(res => {
                this.profilePictureRef.child(this.councilId + '//' + filesArray[i].$key + '//' + (this.filesArray[i].name || this.filesArray[i].filename)).delete().then(res => {
                    loader.dismiss();
                }).catch(err => {
                    loader.dismiss();
                    console.log(err);
                })
            }).catch(err => {
                loader.dismiss();
                console.log(err);
            })

        })
        this.filesArray = [];
    }
}
