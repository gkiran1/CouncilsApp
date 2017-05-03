import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewCouncilFilePage } from '../new-council-file/new-council-file';
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
    councilsIds: any;
    user;
    count$ = new Subject();
    filesArray = [];
    profilePictureRef: any;
    notificationsCount;
    isFilesListPage = false;
    userSubscription: Subscription;
    constructor(
        public fs: FirebaseService,
        public nav: NavController,
        public af: AngularFire,
        public loadingCtrl: LoadingController) {
        this.filesArray = [];
        this.profilePictureRef = firebase.storage().ref('/files/');

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    console.log(this.user);
                    af.database.list('/files').subscribe(files => {
                        this.filesArray = [];

                        this.user.councils.forEach(council => {
                            let f;
                            files.forEach(file => {
                                if (council === file.councilid) {
                                    f = file;
                                }
                            });
                            if (f) this.filesArray.push(f);
                        });

                        let count = this.filesArray.length;
                        count = count ? count : null;
                        this.count$.next(count);
                    })
                })
            }
        });
        fs.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });
    }

    viewCouncilFile(item) {
        console.log(item);
        // alert(item.councilid)
        this.nav.push(OpenCouncilFilePage, { item: item, flag: this.isFilesListPage }, { animate: true, animation: 'transition', direction: 'forward' });
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
    addFile() {
        this.nav.push(NewCouncilFilePage);
    }
}
