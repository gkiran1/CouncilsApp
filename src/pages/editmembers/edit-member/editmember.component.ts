import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
    templateUrl: 'editmember.html',
    selector: 'editmember-page'
})

export class EditMemberPage {

    constructor(private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController, public af: AngularFire) { }

    back() {
        this.nav.pop();
    }
}