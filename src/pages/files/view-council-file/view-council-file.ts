import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { WelcomePage } from '../../menu/menu';
import { Transfer, File } from 'ionic-native';
import * as firebase from 'firebase';

@Component({
    templateUrl: 'view-council-file.html',
    selector: 'view-council-file-page'
})
export class ViewCouncilFilePage {
    count$ = new Subject();
    filesArray = [];
    profilePictureRef: any;
    councilId: any;
    councilName: any;
    constructor(
        public fs: FirebaseService,
        public nav: NavController,
        public navparams: NavParams,
        public loadingCtrl: LoadingController,
        public platform: Platform) {

        this.filesArray = [];
        this.profilePictureRef = firebase.storage().ref('/files/');
        this.councilId = navparams.get('councilid')
        this.councilName = navparams.get('councilname');
    
        fs.getFilesByCouncil(this.councilId).subscribe(files => {
            this.filesArray.push(...files);
        });
        
    }
    downloadFile(item) {
        let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: "Please wait while downloading...",
        });
        let ProfileRef = this.profilePictureRef.child(item.councilid + '//' + item.$key + '//' + item.filename)

        this.platform.ready().then(() => {
            (<any>window).requestFileSystem((<any>window).LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
        });
        function onFileSystemSuccess(fileSystem) {
            let fileTransfer = new Transfer();
            ProfileRef.getDownloadURL().then(function (url) {
                alert(url)
                fileSystem.root.getDirectory("/CouncilDownloads", {
                    create: true,
                    exclusive: false
                }, function (dirEntry) { 

                    // alert('path:' + dirEntry.fullPath)
                    var targetPath = dirEntry.fullPath + item.filename;
                    // alert(targetPath);
                    // var uri = encodeURI(url);
                    loader.present();
                    fileTransfer.download(
                        url,
                        targetPath + item.filename).then(entry => {
                            loader.dismiss();
                            alert("download complete: " + entry.fullPath);
                        }).catch(error => {
                            loader.dismiss();
                            alert("download error source " + error.source);
                            // alert("download error target " + error.target);
                            // alert("upload error code" + error.code);
                        }
                        );
                }, function () {
                    alert('failed to get directory.');
                }
                );
            });
        }
        function fail() {
            loader.dismiss();
            console.log("failed to get filesystem");
        }

    }

    back() {
        this.nav.pop();
    }
}

 // let ProfileRef = this.profilePictureRef.child(item.councilid + '//' + item.$key + '//' + item.filename)
        // let fileTransfer = new Transfer();
        // ProfileRef.getDownloadURL().then(function (url) {
        //     console.log(url);
        //     var targetPath = cordova.file.externalDataDirectory + '/CouncilDownloads/' + item.filename;
        //     // alert(targetPath);
        //     var trustHosts = true;
        //     var options = {};
        //     loader.present();
        //     fileTransfer.download(url, targetPath, trustHosts, options).then(res => {
        //         alert('file downloaded.' + res.toNativeURL());
        //         loader.dismiss();
        //     }).catch(err => {
        //         loader.dismiss();
        //         alert('could not download file.' + JSON.stringify(err));
        //         console.log(err);
        //     })

        // }).catch(function (error) {
        //     loader.dismiss();
        //     alert(error);
        //     console.log(error);
        // });