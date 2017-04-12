import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController, MenuController, LoadingController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Camera, Toast, File, FileChooser, FilePath } from 'ionic-native';
import { Content } from 'ionic-angular';
import * as firebase from 'firebase';
import * as moment from 'moment';

@Component({
    templateUrl: 'open-council-file.html',
    selector: 'open-council-file-page'
    // providers: [FirebaseService]
})
export class OpenCouncilFilePage {
    //metadata
    file = {
        $key: '',
        councilid: '',
        name: '',
        type: ''
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
    openCouncilFileForm: FormGroup;
    filepath1: string;
    i = 2;
    constructor(public navparams: NavParams,
        public nav: NavController,
        public appservice: AppService,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController) {

        this.profilePictureRef = firebase.storage().ref('/files/');
        appservice.getUser().subscribe(user => this.user = user);
        this.file = navparams.get('file');
        this.value = navparams.get('value');
        this.file.$key = navparams.get('file1');
        this.file.name = this.value.filename;
        this.file.type = this.value.filetype;
        this.filesArray.push(this.file);
        firebaseservice.getFilesByKey(navparams.get('file1')).subscribe(res => {
            this.file1 = res;
        });

    }
    delete(file) {
        let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: "Deleting file...",
        });
        loader.present();
        //to delete files form the database using key
        this.firebaseservice.deleteFilesByKey(file.$key).then((res) => {
            //to delete files from the storage using file name
            this.profilePictureRef.child(this.value.councilid + '//' + file.$key + '//' + file.name).delete().then(res => {
                this.filesArray.forEach((f, i) => {
                    if (f.$key == file.$key) {
                        loader.dismiss();
                        this.filesArray.splice(i, 1);
                        console.log(this.filesArray);
                    }
                })
            }).catch((error) => {
                console.log(error);
            });
        }).catch((err) => {
            console.log(err);
        });
    }
    deleteFiles(filesArray) {
        let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: "Deleting files...",
        });
        loader.present();
        this.filesArray.forEach((f, i) => {
            //to delete all the files in the array
            this.firebaseservice.deleteFilesByKey(filesArray[i].$key).then(res => {
                this.profilePictureRef.child(this.value.councilid + '//' + filesArray[i].$key + '//' + this.filesArray[i].name).delete().then(res => {
                    loader.dismiss();
                    this.filesArray.splice(0, this.filesArray.length);
                }).catch(err => {
                    console.log(err);
                })
            }).catch(err => {
                console.log(err);
            })

        })
    }
    edit() {
        this.deleteflag = true;
    }
    done() {
        this.deleteflag = false;
    }
    back() {
        this.nav.pop();
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
            this.value.createdDate = moment().toISOString();
            this.value.councilid = value.council.$key;
            this.value.councilname = value.council.council;
            value.filename = value.councilname + '_file' + this.i++ + '.png';
            value.filetype = (value.filename.substr(value.filename.lastIndexOf('.') + 1)).toUpperCase();
            this.firebaseservice.saveFile(value).then(fileId => {
                this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename)
                    .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
                    .then((savedPicture) => {
                        this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + value.filename).getMetadata();
                        this.pictureRef.then((metadata) => {
                            // Metadata now contains the metadata like filesize and type for 'images/...'
                            this.file = metadata;
                            this.file.$key = fileId;
                            this.file.name = value.filename;
                            this.file.type = value.filetype;
                            this.filesArray.push(this.file);
                            this.value.councilname = value.councilname;
                            this.value.filename = value.filename;
                            this.value.filetype = value.filetype;
                        }).catch((error) => {
                            console.log(error);
                        });
                    }).catch(err => {
                        console.log(err);
                    })
            }).catch(err => {
                console.log(err);
            })
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }
    // to upload a picture from gallery to the firebase.
    uploadPicture(value) {

    }
    // to upload files from the device.
    importFile(value) {
        let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: "Please wait while uploading...",
        });
        FileChooser.open()
            .then(uri => {
                this.filepath1 = uri.toString();
                FilePath.resolveNativePath(this.filepath1)
                    .then(filePath => {
                        (<any>window).resolveLocalFileSystemURL(filePath, (res) => {
                            res.file((resFile) => {
                                var reader = new FileReader();
                                reader.readAsArrayBuffer(resFile);
                                reader.onloadend = (evt: any) => {
                                    var imgBlob = new Blob([evt.target.result]);
                                    loader.present();
                                    var filename = filePath.substring(filePath.lastIndexOf('/') + 1);
                                    var filetype = (filename.substr(filename.lastIndexOf('.') + 1)).toUpperCase();
                                    var mimeType;
                                    switch (filetype) {
                                        case value: 'PNG'
                                            mimeType = 'image/png';
                                            break;
                                        case value: 'JPG'
                                            mimeType = 'image/jpeg';
                                            break;
                                        case value: 'DOC'
                                            mimeType = 'application/msword';
                                            break;
                                        case value: 'PDF'
                                            mimeType = 'application/pdf';
                                            break;
                                        case value: 'XLS'
                                            mimeType = 'application/excel';
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
                                            .putString(filePath)
                                            .then((savedPicture) => {
                                                this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + fileId + '//' + filename).getMetadata();
                                                this.pictureRef.then((metadata) => {
                                                    loader.dismiss();
                                                    // Metadata now contains the metadata like filesize and type for 'images/...'
                                                    this.file = metadata;
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
    }
}