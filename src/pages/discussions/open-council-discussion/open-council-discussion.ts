import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Content } from 'ionic-angular';
import { CouncilUsersModalPage } from '../councilusers/councilusers';
import { AngularFire } from 'angularfire2';

@Component({
    templateUrl: 'open-council-discussion.html',
    selector: 'open-council-discussion-page'
})
export class OpenCouncilDiscussionPage {
    @ViewChild(Content) content: Content;
    discussion = {
        $key: '',
        messages: [],
        councilid: '',
        typings: ''
    }
    msg = '';
    user;
    activeusersCount = 0;
    councilusersModal;
    isModalDismissed = true;
    isTyping = true;
    constructor(public af: AngularFire, public modalCtrl: ModalController, public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService) {
        // as.getUser().subscribe(user => this.user = user);
        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                });
            }
        });
        fs.getDiscussionByKey(navparams.get('discussion')).subscribe(discussion => {
            this.discussion = discussion;
            this.discussion.messages = this.discussion.messages || [];
            this.discussion.messages = Object.keys(this.discussion.messages).map(e => this.discussion.messages[e]);
            this.discussion.typings = this.discussion.typings || '';
            fs.getActiveUsersFromCouncil(discussion.councilid).subscribe(users => {
                this.activeusersCount = users.length;
            });
        });
    }
    back() {
        this.nav.pop();
    }

    ionViewDidEnter() {
        this.content.scrollToBottom();
    }
    send() {
        if (this.msg) {
            let chatObj = {
                text: this.msg,
                timestamp: new Date().toISOString(),
                userId: this.as.uid,
                user_firstname: this.user.firstname,
                user_lastname: this.user.lastname,
                user_avatar: this.user.avatar
            }
            this.fs.updateDiscussionChat(this.discussion.$key, chatObj)
                .then(res => {
                    //
                })
                .catch(err => {
                    console.log(err);
                });

            setTimeout(() => {
                this.content.scrollToBottom();
            }, 10);
            this.msg = '';
        }
    }

    keypresssed($event) {
        console.log('---------------> $event.target.value', $event.target.value);
        $event.target.value = $event.target.value + ''; //should always be a string
        if ($event.target.value.includes('@')) {

            if (this.isModalDismissed) {
                this.councilusersModal = this.modalCtrl.create(CouncilUsersModalPage, { councilid: this.discussion.councilid });
                this.councilusersModal.onDidDismiss(user => {
                    if (!user) return;
                    this.msg = `${this.msg}${user.firstname} ${user.lastname}`
                    this.isModalDismissed = true;
                    console.log('modal dismissed::', user);
                });
                this.councilusersModal.present();
                this.isModalDismissed = false;
            }
        } else {
            if (!this.isModalDismissed) {
                this.councilusersModal.dismiss();
                this.isModalDismissed = true;
            }
        }
    }

    focusIn() {
        //check whether username is already added to typings string. if so, dont add it again.
        if (this.discussion.typings.includes(this.user.firstname)) return;
        this.discussion.typings = this.discussion.typings + this.discussion.typings ? ', ' : '' + this.user.firstname + ' is typing..';
        this.fs.updateDiscussion(this.discussion.$key, this.discussion.typings)
            .then(res => {
                //
            })
            .catch(err => {
                console.log(err);
            });
    }
    focusOut() {
        //username must have been added already in onfoucs event.So, removing it from the typings string
        this.discussion.typings = this.discussion.typings.replace(this.user.firstname + ' is typing..', '');
        this.fs.updateDiscussion(this.discussion.$key, this.discussion.typings)
            .then(res => {
                //
            })
            .catch(err => {
                console.log(err);
            });
    }
}
