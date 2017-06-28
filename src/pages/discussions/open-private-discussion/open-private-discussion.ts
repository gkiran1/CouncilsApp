import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Content } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { NativeAudio } from '@ionic-native/native-audio';

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
    createdBy;
    isTyping = true;
    statusSubscription;
    buttonClicked = true;
    tbottom = '';
    constructor(public platform: Platform, public af: AngularFire, public ele: ElementRef, public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService, private nativeAudio: NativeAudio) {
        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    fs.getPrivateDiscussionByKey(navparams.get('discussion')).subscribe(discussion => {
                        this.discussion = discussion;
                        if (this.buttonClicked === false && discussion.lastMsg.user_firstname + ' ' + discussion.lastMsg.user_lastname !== this.user.firstname + ' ' + this.user.lastname && discussion.isNotificationReq) {
                            this.nativeAudio.play('chime');
                        }
                        this.chatWith = discussion.createdUserId === this.user.$key ? discussion.otherUserName : discussion.createdUserName;
                        this.createdBy = discussion.createdUserId === this.user.$key ? 'You' : discussion.createdUserName;
                        this.discussion.messages = this.discussion.messages || [];
                        this.discussion.typings = this.discussion.typings || '';
                        this.discussion.messages = Object.keys(this.discussion.messages).map(e => this.discussion.messages[e]);
                        this.buttonClicked = false;
                    });
                });
            }
        });
    }

    back() {
        this.nav.popToRoot({ animate: true, animation: 'transition', direction: 'back' });
    }
    ionViewDidEnter() {
        if (this.discussion.typings) {
            let style = window.getComputedStyle(this.ele.nativeElement.querySelector('.scroll-content'))
            let newBottom = (Number.parseFloat(style.getPropertyValue('margin-bottom').replace(/px/, '')) + 10) + 'px';
            this.ele.nativeElement.querySelector('.scroll-content').style.marginBottom = newBottom;
        }
        this.content.scrollToBottom();
        this.tbottom = this.ele.nativeElement.querySelector('ion-footer').offsetHeight + 'px';
        this.statusSubscription = this.fs.getPrivateDiscussionByKey(this.navparams.get('discussion')).subscribe(discussion => {
            discussion.messages = discussion.messages || [];
            Object.keys(discussion.messages).forEach(e => {
                let message = discussion.messages[e];
                if (message.userId !== this.user.$key && message.status !== 'read') {
                    this.fs.updatePrivateDiscussionMessageStatus(discussion.$key, e, 'read')
                        .catch(err => {
                        });
                }
            });
        });
        this.platform.pause.subscribe(() => {
            this.discussion.typings = this.discussion.typings.replace(', ' + this.user.firstname + ' is typing..', '').replace(this.user.firstname + ' is typing..', '');
            this.fs.updatePrivateDiscussion(this.discussion.$key, this.discussion.typings)
                .then(res => {
                    //
                })
                .catch(err => {
                });
        });
    }
    ionViewDidLeave() {
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
            this.fs.updatePrivateDiscussionChat(this.discussion.$key, chatObj, this.discussion)
                .then(res => {
                    //
                })
                .catch(err => {
                });

            setTimeout(() => {
                this.content.scrollToBottom();
            }, 10);
            this.msg = '';
            document.getElementsByTagName('textarea')[0].style.height = '24px'; //1 row height
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
            });
    }

    keypresssed($event) {
        this.tbottom = this.ele.nativeElement.querySelector('ion-footer').offsetHeight + 'px';
    }
}
