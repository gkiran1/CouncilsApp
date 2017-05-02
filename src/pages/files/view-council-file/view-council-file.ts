import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { Transfer, File } from 'ionic-native';
import * as firebase from 'firebase';
declare var FileTransfer;

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
    device: string;
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
        platform.ready().then(() => {
            if (this.platform.is('ios')) {
                this.device = "ios";
            }
            else {
                this.device = "android";
            }

        });

        fs.getFilesByCouncil(this.councilId).subscribe(files => {
            this.filesArray.push(...files);
        });

    }
    downloadFile(item) {
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        if (this.device !== undefined && this.device !== 'android') {

            var targetPath = cordova.file.documentsDirectory + '/CouncilDownloads/' + item.filename;
            alert(targetPath);

        } else {
            var targetPath = cordova.file.cacheDirectory + '/CouncilDownloads/' + item.filename;
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
                            alert('Error status: ' + e.status + ' - Error message: ' + e.message);
                        },
                        success: function () {
                            loader.dismiss();
                            console.log('file opened successfully.');
                        }
                    }
                );
            }, function (e) {
                loader.dismiss();
                alert('Target path:' + targetPath + JSON.stringify(e));
            })

        }).catch((error) => {
            loader.dismiss();
            console.log(error);
        });

    }

    back() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });

    }
}
