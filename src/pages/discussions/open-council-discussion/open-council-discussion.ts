import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Content } from 'ionic-angular';

@Component({
    templateUrl: 'open-council-discussion.html',
    selector: 'open-council-discussion-page'
})
export class OpenCouncilDiscussionPage {
    @ViewChild(Content) content: Content;
    discussion = {
        $key: '',
        messages: []
    }
    msg = '';
    user;
    activeusersCount = 0;
    constructor(public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService) {
        as.getUser().subscribe(user => this.user = user);
        fs.getDiscussionByKey(navparams.get('discussion')).subscribe(discussion => {
            this.discussion = discussion;
            this.discussion.messages = this.discussion.messages || [];
            this.discussion.messages = Object.keys(this.discussion.messages).map(e => this.discussion.messages[e]);
            fs.getActiveUsersFromCouncil(discussion.councilid).subscribe(users=>{
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
                user_firstname:this.user.firstname,
                user_lastname:this.user.lastname,
                user_avatar:this.user.avatar
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

}
