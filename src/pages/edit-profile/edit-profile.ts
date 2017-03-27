import { Component } from '@angular/core';
import { Nav, NavController, AlertController, ActionSheetController, MenuController } from 'ionic-angular';
import { ChangePasswordPage } from '../edit-profile/change-password';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
//import { WelcomePage } from '../menu/menu';
import { User } from '../../user/user';
import { Toast } from 'ionic-native';
import { Camera } from 'ionic-native';
import * as firebase from 'firebase';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Subscription } from "rxjs";
import { SettingsPage } from '../settings/settings';

@Component({
    selector: 'edit-profile',
    templateUrl: 'edit-profile.html',
    providers: [FirebaseService]
})
export class EditProfilePage {
    profilePictureRef: any;
    guestPicture: any;
    imagePath: any;
    profile: any;
    $key: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    ldsusername: string;
    phone: string;
    avatar: string;
    imageflag = true;
    isChangeflag = false;
    userSubscription: Subscription

    constructor(public af: AngularFire, public nav: NavController,
        public appService: AppService,
        private firebaseService: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController,
        public alertCtrl: AlertController) {

        this.profile = new User;

        this.profilePictureRef = firebase.storage().ref('/users/' + '/avatar/');

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(user => {
                    this.profile = user;
                });
            }
        });
    }

    editProfile() {
        if ((new RegExp(/^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/).test(this.profile.phone))) {
            this.guestPicture = this.guestPicture || '';
            this.profilePictureRef.child(this.profile.$key)
                .putString(this.guestPicture, 'base64', { contentType: 'image/png' })
                .then((savedPicture) => {
                    // this.showAlert('picture',savedPicture.downloadURL);
                    let avatar = this.guestPicture ? savedPicture.downloadURL : this.profile.avatar;
                    this.firebaseService.updateProfile(this.profile.$key, this.profile.firstname, this.profile.lastname, this.profile.email, this.profile.phone, this.profile.ldsusername, avatar).then(res => {
                        this.showAlert1('success', 'User profile updated successfully.')
                        this.isChangeflag = false;                        
                    }).catch(err => {
                        this.showAlert('failure', err.message);
                    })
                });
        } else {
            this.showAlert('failure', 'please enter valid phone number.');
        }
    }
    viewChangePasswordPage() {
        this.nav.push(ChangePasswordPage);
    }
    cancel() {
        if (this.isChangeflag) {
            this.showAlertPopup('failure', 'There are unsaved changes.do you want to discard it ?');
        } else {
            this.nav.setRoot(SettingsPage);
        }
    }
    showAlert(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: ['OK']
        });
        alert.present();
    }
    showAlert1(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: [
                { text: 'OK', handler: () => this.nav.push(SettingsPage) }                
            ]
        });
        alert.present();
    }
    showAlertPopup(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: [
                { text: 'OK', handler: () => this.nav.push(SettingsPage) },
                { text: 'Cancel' }
            ]
        });
        alert.present();
    }
    // actions page when click on camera icon.
    cameraActionsPage() {
        let actionSheet = this.actionSheetCtrl.create({
            title: '',
            buttons: [
                {
                    text: 'Camera',
                    icon: 'camera',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.takePicture();
                    }
                },
                {
                    text: 'Gallery',
                    icon: 'albums',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.uploadPicture();
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
    takePicture() {
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
            this.guestPicture = imageData;
            this.imagePath = "data:image/jpeg;base64," + imageData;
            this.imageflag = false;
            this.isChangeflag = true;
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }
    // to upload a picture from gallery to the firebase.
    uploadPicture() {
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
            this.imageflag = false;
            this.isChangeflag = true;
            // this.showAlert('success',this.imagePath);                       
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }

}