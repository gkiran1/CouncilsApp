import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewCouncilFilePage } from '../new-council-file/new-council-file';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { ViewCouncilFilePage } from '../view-council-file/view-council-file';
import { NavController, LoadingController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import * as firebase from 'firebase';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { NewMenuPage } from '../../newmenu/newmenu';
import { NativeAudio } from '@ionic-native/native-audio';

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
        public loadingCtrl: LoadingController, private nativeAudio: NativeAudio) {
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

                        this.filesArray.sort(function (a, b) {
                            return (a.createdDate > b.createdDate) ? -1 : ((a.createdDate < b.createdDate) ? 1 : 0);
                        });

                    });
                });
            }
        });
        fs.getNotCnt().subscribe(count => {
            this.nativeAudio.play('chime');
            this.notificationsCount = count;
        });
    }

    viewCouncilFile(item) {
        console.log(item);
        // alert(item.councilid)
        this.nav.push(ViewCouncilFilePage, { councilid: item.councilid, councilname: item.councilname }, { animate: true, animation: 'transition', direction: 'forward' });
    }
    getCount() {
        return this.count$;
    }
    cancel() {
        this.nav.popToRoot();
    }
    notificationsPage() {
        this.nav.push(NewMenuPage);
    }
    addFile() {
        this.nav.push(NewCouncilFilePage);
    }
}
