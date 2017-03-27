import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewCouncilFilePage } from '../new-council-file/new-council-file';
import { Content } from 'ionic-angular';
import * as firebase from 'firebase';

@Component({
    templateUrl: 'open-council-file.html',
    selector: 'open-council-file-page'
    // providers: [FirebaseService]
})
export class OpenCouncilFilePage {
    //metadata
    file = {
        $key: '',
        councilid: '',
        images: [],
        name: ''
    }
    //files
    file1 = {
        $key: '',
        councilid: '',
        images: []
    }
    deleteflag = false;
    listdisplayflag = false;    
    user;
    value:any;
    activeusersCount = 0;
    profilePictureRef: any;
    openCouncilFileForm: FormGroup;
    constructor(public navparams: NavParams, public nav: NavController, public appservice: AppService, public firebaseservice: FirebaseService) {
        console.log('file:', navparams.get('file'));
        // console.log('file1:',navparams.get('file1'));
        this.profilePictureRef = firebase.storage().ref('/files/');
        appservice.getUser().subscribe(user => this.user = user);
        this.file = navparams.get('file');
        console.log('file:', this.file);
        this.value=navparams.get('value');
        firebaseservice.getFilesByKey(navparams.get('file1')).subscribe(res => {
            this.file1 = res;
            console.log('file1', res);
            // this.file.images = this.file.images || [];
            // this.file.images = Object.keys(this.file.images).map(e => this.file.images[e]);
            // firebaseservice.getActiveUsersFromCouncil(file.councilid).subscribe(users => {
            //     this.activeusersCount = users.length;
            // });
        });
    }
    delete() {
        console.log('fileId:', this.file1.councilid);
    }
    edit() {
        this.deleteflag = true;        
    }
    done() {
        this.listdisplayflag = true;
        this.deleteflag = false;        
        this.firebaseservice.deleteFilesByKey(this.file1.$key).then((res) => {
            this.profilePictureRef.child('/images/' + this.file.name).delete().then(function () {
                console.log('File deleted successfully');
            }).catch(function (error) {
                console.log(error);
            });
        }).catch((err) => {
            console.log(err);
        });
    }
    back() {
        this.nav.pop();
    }
}