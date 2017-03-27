import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilFilePage } from '../open-council-file/open-council-file';
import { NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { WelcomePage } from '../../menu/menu';

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
    constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController) {
        this.filesArray = [];
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
