import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { NavController, Platform } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { WelcomePage } from '../../menu/menu';
import { Transfer, File, FilePath } from 'ionic-native';
import { TransferObject } from '@ionic-native/transfer';
import * as firebase from 'firebase';

@Component({
    templateUrl: 'files-page.html',
    selector: 'files-page'
})
export class FilesListPage {
    count$ = new Subject();
    userSubscription: Subscription;
    isListEmpty = false;
    filesArray = [];
    profilePictureRef: any;
    rootRef: any;
    storageDirectory: string = '';
    constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController, public platform: Platform) {
        this.rootRef = firebase.database().ref();

        this.platform.ready().then(() => {
            // make sure this is on a device, not an emulation (e.g. chrome tools device mode)
            if (!this.platform.is('cordova')) {
                return false;
            }

            if (this.platform.is('ios')) {
                var cordova: any;
                this.storageDirectory = cordova.file.documentsDirectory;
            }
            else if (this.platform.is('android')) {
                this.storageDirectory = cordova.file.dataDirectory;
            }
            else {
                // exit otherwise, but you could add further types here e.g. Windows
                return false;
            }
        });
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
        // alert(ProfileRef);
        let fileTransfer = new Transfer();
        ProfileRef.getDownloadURL().then(function (url) {
            var Path = firebase.database().ref().child('files/' + item.$key);
            // alert(Path)
            // alert(url.toString());           
             var targetPath = "cdvfile://localhost/persistent/android/";
            fileTransfer.download(url, targetPath).then(res => {
                alert('file downloaded ...' + res.toNativeURL());

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
