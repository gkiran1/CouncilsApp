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
        messages: [],
        typings: ''
    }
    msg = '';
    user;
    chatWith;
    isTyping = true;
    statusSubscription;
    constructor(public af: AngularFire, public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService) {
        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    fs.getPrivateDiscussionByKey(navparams.get('discussion')).subscribe(discussion => {
                        this.discussion = discussion;
                        this.chatWith = discussion.createdUserId === this.user.$key ? discussion.otherUserName : discussion.createdUserName;
                        this.discussion.messages = this.discussion.messages || [];
                        this.discussion.typings = this.discussion.typings || '';
                        this.discussion.messages = Object.keys(this.discussion.messages).map(e =>this.discussion.messages[e]);
                    });
                });
            }
        });

    }
    back() {
        this.nav.pop();
    }

    ionViewDidEnter() {
        this.content.scrollToBottom();
        this.statusSubscription = this.fs.getPrivateDiscussionByKey(this.navparams.get('discussion')).subscribe(discussion => {
            Object.keys(discussion.messages).forEach(e => {
                let message = discussion.messages[e];
                if (message.userId !== this.user.$key && message.status !== 'read') {
                    this.fs.updatePrivateDiscussionMessageStatus(discussion.$key, e, 'read')
                        .catch(err => {
                            console.log('Err:: open-council-discussion::', err);
                        });
                }
            });
        });
    }
    ionViewDidLeave(){
        this.statusSubscription.unsubscribe();
    }
    send() {
        if (this.msg) {
            let chatObj = {
                text: this.msg,
                timestamp: new Date().toISOString(),
                userId: this.as.uid,
                user_firstname: this.user.firstname,
                user_lastname: this.user.lastname,
                user_avatar: this.user.avatar,
                status: 'sent'
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
    focusIn() {
        //check whether username is already added to typings string. if so, dont add it again.
        if (this.discussion.typings.includes(this.user.firstname)) return;
        this.discussion.typings = `${this.discussion.typings}${this.discussion.typings ? ', ' : ''}${this.user.firstname} is typing..`;
        this.fs.updatePrivateDiscussion(this.discussion.$key, this.discussion.typings)
            .then(res => {
                //
            })
            .catch(err => {
                console.log(err);
            });
    }
    focusOut() {
        //username must have been added already in onfoucs event.So, removing it from the typings string
        this.discussion.typings = this.discussion.typings.replace(', ' + this.user.firstname + ' is typing..', '').replace(this.user.firstname + ' is typing..', '');
        this.fs.updatePrivateDiscussion(this.discussion.$key, this.discussion.typings)
            .then(res => {
                //
            })
            .catch(err => {
                console.log(err);
            });
    }
}
