import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { NavController, Platform } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { WelcomePage } from '../../menu/menu';
import { Transfer, FilePath, File, FileOpener } from 'ionic-native';
import { TransferObject } from '@ionic-native/transfer';
import * as firebase from 'firebase';

@Component({
    templateUrl: 'files-page.html',
    selector: 'files-page'
})
export class FilesListPage {
    count$ = new Subject();
    filesArray = [];
    profilePictureRef: any;
    constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController, public platform: Platform) {
        this.filesArray = [];
        this.profilePictureRef = firebase.storage().ref('/files/');
        if (localStorage.getItem('userCouncils') !== null) {
            var councilsIds = localStorage.getItem('userCouncils').split(',');
            councilsIds.forEach(councilId => {
                fs.getFilesByCouncilId(councilId).subscribe(files => {
                    this.filesArray.push(...files);
                    this.count$.next(this.filesArray.length);
                    // this.subject.next(this.agendasArray.length);
                });
            });
        }
    }
    downloadFile(item) {
        let ProfileRef = this.profilePictureRef.child(item.councilid + '//' + item.$key + '//' + item.filename)
        let fileTransfer = new Transfer();
        ProfileRef.getDownloadURL().then(function (url) {
            console.log(url);
            var targetPath = cordova.file.dataDirectory + '/CouncilDownloads/' + item.filename;
            // alert(targetPath);
            var trustHosts = true;
            var options = {};
            fileTransfer.download(url, targetPath, trustHosts, options).then(res => {  
                 alert('file downloaded.' + res.toNativeURL());
            }).catch(err => {
                alert('could not download file.' + JSON.stringify(err));
                console.log(err);
            })
        }).catch(function (error) {
            alert(error);
            console.log(error);
        });
    }
    getCount() {
        return this.count$;
    }
    cancel() {
        this.nav.setRoot(WelcomePage);
    }
}
