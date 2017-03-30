import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController, MenuController } from 'ionic-angular';
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
        name: ''
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
    constructor(public navparams: NavParams,
        public nav: NavController,
        public appservice: AppService,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController,
        public alertCtrl: AlertController) {

        this.profilePictureRef = firebase.storage().ref('/files/');
        appservice.getUser().subscribe(user => this.user = user);
        this.file = navparams.get('file');
        this.value = navparams.get('value');
        this.filesArray.push(this.file);
        firebaseservice.getFilesByKey(navparams.get('file1')).subscribe(res => {
            this.file1 = res;
        });

    }
    delete() {   
        //to delete files form the database using key
        this.firebaseservice.deleteFilesByKey(this.file1.$key).then((res) => {
            //to delete files from the storage using file name
            this.profilePictureRef.child(this.value.councilid + '//' + this.file.name).delete().then(function () {
                console.log('File deleted successfully');
            }).catch(function (error) {
                console.log(error);
            });
        }).catch((err) => {
            console.log(err);
        });
    }
    edit() {
        this.deleteflag = true;
    }
    done() {
        this.deleteflag = false;
        this.listdisplayflag = true;
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
            let x = Math.floor(Math.random() * 5000);
            this.profilePictureRef.child(value.councilid + '//' + x)
                .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
                .then((savedPicture) => {
                    this.firebaseservice.saveFile(value, savedPicture.downloadURL).then(fileId => {
                        this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + x).getMetadata();
                        this.pictureRef.then((metadata) => {
                            // Metadata now contains the metadata like filesize and type for 'images/...'
                            this.file = metadata;
                            this.filesArray.push(this.file);
                            this.value.councilname = value.councilname;
                        }).catch((error) => {
                            console.log(error);
                        });
                    }).catch(err => {
                        console.log(err);
                    })
                }).catch(err => {
                    alert(err);
                })
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
            this.value.createdDate = moment().toISOString();
            this.value.councilid = value.council.$key;
            this.value.councilname = value.council.council;
            let x = Math.floor(Math.random() * 5000);
            this.profilePictureRef.child(value.councilid + '//' + x)
                .putString(this.guestPicture, 'base64', { contentType: 'PNG' })
                .then((savedPicture) => {
                    this.firebaseservice.saveFile(value, savedPicture.downloadURL).then(fileId => {
                        this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + x).getMetadata();
                        this.pictureRef.then((metadata) => {
                            // Metadata now contains the metadata like filesize and type for 'images/...'                                                       
                            this.file = metadata;
                            this.filesArray.push(this.file);
                            console.log(this.filesArray);
                            this.value.councilname = value.councilname;
                        }).catch((error) => {
                            console.log(error);
                        });
                    }).catch(err => {
                        console.log(err);
                    })
                }).catch(err => {
                    alert(err);
                })
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }
    importFile(value) {
        FileChooser.open()
            .then(uri => {
                this.filepath1 = uri.toString();
                FilePath.resolveNativePath(this.filepath1)
                    .then(filePath => {
                        this.value.createdDate = moment().toISOString();
                        this.value.councilid = value.council.$key;
                        this.value.councilname = value.council.council;
                        let x = Math.floor(Math.random() * 5000);
                        this.profilePictureRef.child(value.councilid + '//' + x)
                            .putString(filePath)
                            .then((savedPicture) => {
                                this.firebaseservice.saveFile(value, filePath).then(fileId => {
                                    this.pictureRef = this.profilePictureRef.child(value.councilid + '//' + x).getMetadata();
                                    this.pictureRef.then((metadata) => {
                                        // Metadata now contains the metadata like filesize and type for 'images/...'
                                        this.file = metadata;
                                        this.filesArray.push(this.file);
                                        this.value.councilname = value.councilname;
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
}