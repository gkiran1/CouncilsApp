import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, AlertController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { WelcomePage } from '../../menu/menu';
import { Transfer, File } from 'ionic-native';
import * as firebase from 'firebase';

@Component({
    templateUrl: 'view-council-file.html',
    selector: 'view-council-file-page'
})
export class ViewCouncilFilePage {
    count$ = new Subject();
    filesArray = [];
    profilePictureRef: any;
    councilId: any;
    councilName: any;
    constructor(
        public fs: FirebaseService,
        public nav: NavController,
        public navparams: NavParams,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public platform: Platform) {

        this.filesArray = [];
        this.profilePictureRef = firebase.storage().ref('/files/');
        this.councilId = navparams.get('councilid')
        this.councilName = navparams.get('councilname');

        fs.getFilesByCouncil(this.councilId).subscribe(files => {
            this.filesArray.push(...files);
        });

    }
    downloadFile(item) {
        let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: "Please wait while downloading...",
        });
        let ProfileRef = this.profilePictureRef.child(item.councilid + '//' + item.$key + '//' + item.filename)
        let fileTransfer = new Transfer();
        ProfileRef.getDownloadURL().then(function (url) {
            console.log(url);
            if (this.platform.is('ios')) {
                var targetPath = cordova.file.documentsDirectory + '/CouncilDownloads/' + item.filename;
            } else {
                var targetPath = cordova.file.dataDirectory + '/CouncilDownloads/' + item.filename;
            }
            // alert(targetPath);
            var trustHosts = true;
            var options = {};
            loader.present();
            fileTransfer.download(url, targetPath, trustHosts, options).then(res => {
                loader.dismiss();
                this.showAlert('success', 'File downloaded.'); 
            }).catch(err => {
                loader.dismiss();
                // alert('could not download file.' + JSON.stringify(err));
                console.log(err);
            })

        }).catch(function (error) {
            loader.dismiss();
            // alert(error);
            console.log(error);
        });

    }

    back() {
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
