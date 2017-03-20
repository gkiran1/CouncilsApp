import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewCouncilFilePage } from '../new-council-file/new-council-file';
import { Content } from 'ionic-angular';

@Component({
    templateUrl: 'open-council-file.html',
    selector: 'open-council-file-page'
})
export class OpenCouncilFilePage {
    file = {
        $key: '',
        images: []
    }
    user;
    activeusersCount = 0;    
    constructor(public navparams: NavParams, public nav: NavController, public appservice: AppService, public firebaseservice: FirebaseService) {
        appservice.getUser().subscribe(user => this.user = user);
        firebaseservice.getFilesByKey(navparams.get('file')).subscribe(file => {
            this.file = file;
            console.log(file);            
            // this.file.images = this.file.images || [];
            // this.file.images = Object.keys(this.file.images).map(e => this.file.images[e]);
            // firebaseservice.getActiveUsersFromCouncil(file.councilid).subscribe(users => {
            //     this.activeusersCount = users.length;
            // });
        });        
    }
    back() {
        this.nav.pop();
    }
}