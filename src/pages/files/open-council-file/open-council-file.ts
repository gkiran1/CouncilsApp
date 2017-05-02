import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController, MenuController, LoadingController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Camera, Toast, File, FileChooser, FilePath } from 'ionic-native';
import { Content } from 'ionic-angular';
import * as firebase from 'firebase';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import * as moment from 'moment';
declare var FileTransfer;

@Component({
    templateUrl: 'open-council-file.html',
    selector: 'open-council-file-page'
    // providers: [Firebase
})
export class OpenCouncilFilePage {
    //metadata
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
    listdisplayflag = false;
    addfileflag = false;
    user;
    value: any;
    activeusersCount = 0;
    guestPicture: any;
    imagePath: any;
    profilePictureRef: any;
    pictureRef: any;
    councilId: any;
    councils: any;
    size: any;
    openCouncilFileForm: FormGroup;
    filepath1: string;
    isNewCouncilFileflag = true;
    userSubscription: Subscription;
    now = moment().valueOf();
    constructor(public navparams: NavParams,
        public nav: NavController,
        public af: AngularFire,
        public appservice: AppService,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController) {
        this.profilePictureRef = firebase.storage().ref('/files/');
        appservice.getUser().subscribe(user => this.user = user);
        this.isNewCouncilFileflag = navparams.get('flag');
        // alert(this.isNewCouncilFileflag);
        if (this.isNewCouncilFileflag) {
            this.file = navparams.get('file');
            this.value = navparams.get('value');
            this.file.$key = navparams.get('file1');
            this.file.name = this.value.filename;
            this.file.type = this.value.filetype;
            this.filesArray.push(this.file);
            firebaseservice.getFilesByKey(navparams.get('file1')).subscribe(res => {
                this.file1 = res;
            });
            this.file.size = this.formatBytes(this.file.size);
        }
        else {
            this.file = navparams.get('item');
            this.value = this.file;
            console.log(this.file);
            this.councilId = this.file.councilid;
            this.userSubscription = this.af.auth.subscribe(auth => {
                if (auth !== null) {
                    firebaseservice.getFilesByCouncil(this.councilId).subscribe(files => {
                        this.pictureRef = this.profilePictureRef.child(this.councilId + '//' + this.file.$key + '//' + this.value.filename).getMetadata();
                        this.pictureRef.then((metadata) => {
                            this.filesArray.push(...files);
                            this.size = this.formatBytes(metadata.size);
                            // this.subject.next(this.agendasArray.length);
                        })
                    });
                }
                // if (auth !== null) {
                //     this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                //         this.user = usr;
                //         console.log(this.file.councilid);

                //         af.database.list('/files').subscribe(files => {
                //             this.filesArray = [];
                //             files.forEach(file => {
                //                 if (this.user.councils.includes(this.file.councilid)) {
                //                     this.pictureRef = this.profilePictureRef.child(this.councilId + '//' + this.file.$key + '//' + this.value.filename).getMetadata();
                //                     this.pictureRef.then((metadata) => {
                //                         this.filesArray.push(...files);
                //                         this.size = this.formatBytes(metadata.size);
                //                         // this.subject.next(this.agendasArray.length);
                //                     })
                //                 }
                //             });
                //         })
                //     })
                // }
            });
        }
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
            this.profilePictureRef.child(this.value.councilid + '//' + file.$key + '//' + (file.name || file.filename)).delete().then(res => {
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
                this.profilePictureRef.child(this.value.councilid + '//' + filesArray[i].$key + '//' + (this.filesArray[i].name || this.filesArray[i].filename)).delete().then(res => {
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
    downloadFile(item) {
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        // path to download a file to mobile.
        var targetPath = cordova.file.cacheDirectory + '/CouncilDownloads/' + item.filename;
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
                            // alert('Error status: ' + e.status + ' - Error message: ' + e.message);
                        },
                        success: function () {
                            loader.dismiss();
                            console.log('file opened successfully.');
                        }
                    }
                );
            }, function (e) {
                loader.dismiss();
                // alert('Target path:' + targetPath + JSON.stringify(e));
            })

        }).catch((error) => {
            loader.dismiss();
            console.log(error);
        });

    }
    edit() {
        this.deleteflag = true;
    }
    done() {
        this.deleteflag = false;
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
    // to upload a picture to the firebase.
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
        // this.isNewCouncilFileflag = true;
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        FileChooser.open()
            .then(uri => {
                loader.present();
                this.filepath1 = uri.toString();
                FilePath.resolveNativePath(this.filepath1)
                    .then(filePath => {
                        (<any>window).resolveLocalFileSystemURL(filePath, (res) => {
                            res.file((resFile) => {
                                var reader = new FileReader();
                                reader.readAsArrayBuffer(resFile);
                                reader.onloadend = (evt: any) => {
                                    var imgBlob = new Blob([evt.target.result]);
                                    var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
                                    var filetype = (filename.substr(filename.lastIndexOf('.') + 1)).toUpperCase();
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
                                    this.value.createdDate = moment().toISOString();
                                    this.value.councilid = value.council.$key;
                                    this.value.councilname = value.council.council;
                                    this.value.filename = filename;
                                    this.value.filetype = filetype;
                                    this.firebaseservice.saveFile(value).then(fileId => {
                                        this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename)
                                            .put(imgBlob, { contentType: mimeType })
                                            .then((savedPicture) => {
                                                this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename).getMetadata();
                                                this.pictureRef.then((metadata) => {
                                                    loader.dismiss();
                                                    // Metadata now contains the metadata like filesize and type for 'images/...'
                                                    this.file = metadata;
                                                    this.file.size = this.formatBytes(this.file.size);
                                                    this.file.$key = fileId;
                                                    this.file.name = filename;
                                                    this.file.type = filetype;
                                                    this.filesArray.push(this.file);
                                                    this.value.councilname = value.councilname;
                                                    this.value.filename = value.filename;
                                                    this.value.filetype = filetype;
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
                                }
                            })
                        })
                    }).catch(e => {
                        loader.dismiss();
                        console.log(e);
                    });
            }).catch(e => {
                loader.dismiss();
                console.log(e);
            });

            loader.dismiss();
    }
    // to convert bytes to KB/MB/GB/TB formats
    formatBytes(bytes) {
        // this.isNewCouncilFileflag = true;
        if (bytes < 1024) return bytes + "b";
        else if (bytes < 1048576) return Math.round(bytes / 1024) + "kb";
        else if (bytes < 1073741824) return Math.round(bytes / 1048576) + "mb";
        else if (bytes < 1099511627776) return Math.round(bytes / 1073741824) + "gb";
        else return Math.round(bytes / 1099511627776) + "tb";
    };
}