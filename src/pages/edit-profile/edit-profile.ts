import { Component } from '@angular/core';
import { Nav, NavController, AlertController, ActionSheetController, MenuController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ChangePasswordPage } from '../edit-profile/change-password';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
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
    editProfileForm: FormGroup;
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
    isPicNotChanged = true;
    constructor(fb: FormBuilder, public af: AngularFire, public nav: NavController,
        public appService: AppService,
        private firebaseService: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController,
        public loadingCtrl: LoadingController,
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
        this.editProfileForm = fb.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', Validators.required],
        phone: ['', Validators.compose([Validators.required, Validators.pattern(/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/)])],
            ldsusername: ['', Validators.required],
            
        });
    }

    editProfile(value) {
        let loader = this.loadingCtrl.create({
             spinner:'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        
            this.guestPicture = this.guestPicture || '';
            this.profilePictureRef.child(this.profile.$key)
                .putString(this.guestPicture, 'base64', { contentType: 'image/png' })
                .then((savedPicture) => {
                    // this.showAlert('picture',savedPicture.downloadURL);
                    let avatar = this.guestPicture ? savedPicture.downloadURL : this.profile.avatar;
                    this.firebaseService.updateProfile(this.profile.$key, this.profile.firstname, this.profile.lastname, this.profile.email, this.profile.phone, this.profile.ldsusername, avatar).then(res => {
                        loader.dismiss();
                        
                        this.isChangeflag = false;
                        this.isPicNotChanged = true;
                    }).catch(err => {
                        loader.dismiss();
                        console.log(err);
                    })
                });
        
    }
    viewChangePasswordPage() {
        this.nav.push(ChangePasswordPage);
    }
    cancel() {
        if (this.isChangeflag) {
            this.showAlertPopup('failure', 'There are unsaved changes.do you want to discard it ?');
        } else {
           this.nav.popToRoot({ animate: true, animation: 'transition', direction: 'back' });
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
                { text: 'OK', handler: () => this.nav.popToRoot() }
            ]
        });
        alert.present();
    }
    showAlertPopup(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: [
                { text: 'OK', handler: () => this.nav.popToRoot() },
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
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.takePicture();
                    }
                },
                {
                    text: 'Gallery',
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
            this.isPicNotChanged = false;
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
            this.isPicNotChanged = false;
            this.imageflag = false;
            this.isChangeflag = true;
            // this.showAlert('success',this.imagePath);                       
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }

}