import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { NavController, Platform } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { WelcomePage } from '../../menu/menu';
import { Transfer } from 'ionic-native';
import * as firebase from 'firebase';

@Component({
    templateUrl: 'files-page.html',
    selector: 'files-page'
})
export class FilesListPage {
    // files = [];
    count$ = new Subject();
    userSubscription: Subscription;
    isListEmpty = false;
    filesArray = [];
    profilePictureRef: any;
    storageDirectory: string = '';
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
        // this.userSubscription = this.af.auth.subscribe(auth => {
        //     if (auth !== null) {
        //         this.as.getUser().subscribe(user => {
        //             this.files = [];
        //             fs.getFiles().subscribe(files => {
        //                 this.files = files.filter(file => {
        //                     if (user.$key === file.createdUserId || user.$key === file.otherUserId) {
        //                         return true;
        //                     }
        //                     return false;
        //                     // return user.councils.indexOf(file.councilid) !== -1;
        //                 });
        //                 this.isListEmpty = this.files ? false : true;
        //                 this.count$.next(this.files.length);
        //             });
        //         });
        //     }
        // });
    }
    downloadFile(item) {
        // this.platform.ready().then(() => {
        //     let fileTransfer = new Transfer();
        //     let imageLocation = this.profilePictureRef.child(item.councilid + '//' + 'Profilepicture')
        //     fileTransfer.download(this.storageDirectory,'files/-Ke7ZCbP6Kw0SofmBlIx/Profilepicture').then((entry) => {
        //         alert('file downloaded successfully.' + entry.toURL());
        //     }).catch(err => {
        //         alert('err:' + err);
        //     })
        // })
        let ProfileRef = this.profilePictureRef.child(item.councilid + '//' + 'Profilepicture')
        ProfileRef.getDownloadURL().then(function (url) {
            console.log("la url ", url);
            // $scope.url = url;
        }).catch(function (error) {
            alert(error);
        });
    }
    openFile(file) {
        this.nav.push(OpenCouncilFilePage, { file: file })
    }
    getCount() {
        return this.count$;
    }
    cancel() {
        this.nav.setRoot(WelcomePage);
    }
}
