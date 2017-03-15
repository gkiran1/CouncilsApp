import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Content } from 'ionic-angular';

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
    constructor(public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService) {
        as.getUser().subscribe(user => this.user = user);
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
