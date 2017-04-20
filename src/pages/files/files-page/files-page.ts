import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { ViewCouncilFilePage } from '../view-council-file/view-council-file';
import { NavController, Platform, LoadingController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { TransferObject } from '@ionic-native/transfer';
import * as firebase from 'firebase';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';

@Component({
    templateUrl: 'files-page.html',
    selector: 'files-page'
})
export class FilesListPage {
    count$ = new Subject();
    filesArray = [];
    profilePictureRef: any;
    notificationsCount;

    constructor(
        public fs: FirebaseService,
        public nav: NavController,
        public loadingCtrl: LoadingController) {
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

        fs.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });
    }

    viewCouncilFile(item) {
        console.log(item);
        // alert(item.councilid)
        this.nav.push(ViewCouncilFilePage, { councilid: item.councilid, councilname: item.councilname });
    }
    getCount() {
        return this.count$;
    }
    cancel() {
        this.nav.popToRoot();
    }
    notificationsPage() {
        this.nav.push(NotificationsPage);
    }
}
