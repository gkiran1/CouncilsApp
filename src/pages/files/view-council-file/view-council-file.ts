import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
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
            content: "Please wait while opening file...",
        });
        if (this.platform.is('ios')) {
            var targetPath = cordova.file.documentsDirectory + '/CouncilDownloads/' + item.filename;
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
        let fileTransfer = new Transfer();
        ProfileRef.getDownloadURL().then(function (url) {
            console.log(url);
            var trustHosts = true;
            var options = {};
            loader.present();
            fileTransfer.download(url, targetPath, trustHosts, options).then(res => {
                loader.dismiss();
                cordova.plugins.fileOpener2.open(
                    targetPath,
                    mimeType,
                    {
                        error: function (e) {
                            console.log(e);
                            // alert('Error status: ' + e.status + ' - Error message: ' + e.message);
                        },
                        success: function () {
                            console.log('file openrd successfully.');
                            // alert('file opened successfully');
                        }
                    }
                );
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
}
