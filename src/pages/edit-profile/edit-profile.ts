import { Component } from '@angular/core';
import { Nav, NavController, AlertController } from 'ionic-angular';
import { ChangePasswordPage } from '../edit-profile/change-password';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { WelcomePage } from '../welcome/welcome';
import { User } from '../../user/user';
import { Toast } from 'ionic-native';
import { Camera } from 'ionic-native';

@Component({
    selector: 'edit-profile',
    templateUrl: 'edit-profile.html',
    providers: [FirebaseService]
})
export class EditProfilePage {
    guestPicture: any;
    profile: User;
    $key: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    ldsusername: string;
    phone: string;
    constructor(public nav: NavController, public appService: AppService, private firebaseService: FirebaseService, public alertCtrl: AlertController,) {
        this.profile = new User;
        appService.getUser().subscribe(user => {
            this.profile.firstname = user.firstname;
            this.profile.lastname = user.lastname;
            this.profile.email = user.email;
            this.profile.ldsusername = user.ldsusername;
            this.profile.$key = user.$key;
            this.profile.phone = user.phone;
        });
    }
    editProfile() {
        if ((new RegExp(/^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/).test(this.profile.phone))) {
            this.firebaseService.updateProfile(this.profile.$key, this.profile.firstname, this.profile.lastname, this.profile.email, this.profile.phone, this.profile.ldsusername).then(res =>
                this.showAlert('success', 'User profile updated successfully.'))
                .catch(err => this.showAlert('failure', err.message))
        } else {
            this.showAlert('failure', 'please enter valid phone number.');
        }
    }
    viewChangePasswordPage() {
        this.nav.push(ChangePasswordPage);
    }
    cancel() {
        this.nav.push(WelcomePage);
    }
    showAlert(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: ['OK']
        });
        alert.present();
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
        }, error => {
            console.log("ERROR -> " + JSON.stringify(error));
        });
    }

}