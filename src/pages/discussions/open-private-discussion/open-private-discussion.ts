import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Content } from 'ionic-angular';
import { AngularFire } from 'angularfire2';

@Component({
    templateUrl: 'open-private-discussion.html',
    selector: 'open-private-discussion-page'
})
export class OpenPrivateDiscussionPage {
    @ViewChild(Content) content: Content;
    discussion = {
        $key: '',
        messages: []
    }
    msg = '';
    user;
    chatWith;
    constructor(public af: AngularFire, public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService) {
        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                });
            }
        });
        fs.getPrivateDiscussionByKey(navparams.get('discussion')).subscribe(discussion => {
            this.discussion = discussion;
            this.chatWith = discussion.createdUserId === this.user.$key ? discussion.otherUserName : discussion.createdUserName;
            this.discussion.messages = this.discussion.messages || [];
            this.discussion.messages = Object.keys(this.discussion.messages).map(e => this.discussion.messages[e]);
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
            this.fs.updatePrivateDiscussionChat(this.discussion.$key, chatObj)
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

}
