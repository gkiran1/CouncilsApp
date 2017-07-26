import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, MenuController, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangePasswordPage } from '../edit-profile/change-password';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { Camera } from 'ionic-native';
import * as firebase from 'firebase';
import { AngularFire } from 'angularfire2';
import { Subscription } from "rxjs";

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
        public alertCtrl: AlertController,
        public toast: ToastController) {

        this.profile = new User;

        this.profilePictureRef = firebase.storage().ref('/users/' + '/avatar/');

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(user => {
                    this.profile = user;
                    if (this.profile.phone === '') {
                        this.profile.phone = undefined;
                    }
                });
            }
        });

        this.editProfileForm = fb.group({
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)])],
            phone: [this.profile.phone, Validators.compose([Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)])],
            ldsusername: ['', Validators.required]
        });

    }

    editProfile(value) {
        this.isChangeflag = false;
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });

        loader.present();

        if (this.isPicNotChanged) {
            if (this.profile.phone === undefined) {
                this.profile.phone = '';
            }
            this.firebaseService.updateProfileInfo(this.profile.$key, this.profile.firstname, this.profile.lastname, this.profile.email, this.profile.phone, this.profile.ldsusername).then((res) => {
                loader.dismiss();
                //this.isChangeflag = false;
                this.isPicNotChanged = true;
            }).catch(err => {
                loader.dismiss();
            });
        }
        else {
            this.guestPicture = this.guestPicture || '';
            this.profilePictureRef.child(this.profile.$key)
                .putString(this.guestPicture, 'base64', { contentType: 'image/png' })
                .then((savedPicture) => {
                    let avatar = this.guestPicture ? savedPicture.downloadURL : this.profile.avatar;
                    if (this.profile.phone === undefined) {
                        this.profile.phone = '';
                    }
                    this.firebaseService.updateProfile(this.profile.$key, this.profile.firstname, this.profile.lastname, this.profile.email, this.profile.phone, this.profile.ldsusername, avatar).then(res => {
                        loader.dismiss();
                        //this.isChangeflag = false;
                        this.isPicNotChanged = true;
                    }).catch(err => {
                        loader.dismiss();
                    });
                });
        }
    }

    viewChangePasswordPage() {
        this.nav.push(ChangePasswordPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    cancel() {
        if (this.isChangeflag) {
            this.showToaster('Click save to continue');
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

    showToaster(errText) {
        // let alert = this.alertCtrl.create({
        //   title: '',
        //   subTitle: errText,
        //   buttons: ['OK']
        // });
        // alert.present();
        let toast = this.toast.create({
            message: errText,
            duration: 3000
        })

        toast.present();
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
        });
    }

    keypresssed($event) {
        if ($event.target.name === 'phone') {
            this.profile.phone = $event.target.value;
        }

        if (this.editProfileForm.valid) {
            this.isChangeflag = true;
        }
        else {
            this.isChangeflag = false;
        }
    }

    // phonekeypresssed($event) {
    //     this.profile.phone = $event.target.value;
    //     if (this.editProfileForm.valid) {
    //         this.isChangeflag = true;
    //     }
    // }

}