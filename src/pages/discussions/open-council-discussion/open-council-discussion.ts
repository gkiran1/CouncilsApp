import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, ModalController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Content } from 'ionic-angular';
import { CouncilUsersModalPage } from '../../../modals/council-users/council-users';
import { AngularFire } from 'angularfire2';
import { NativeAudio } from '@ionic-native/native-audio';

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
        typings: '',
        councilname: ''
    }
    msg = '';
    user;
    activeusersCount = 0;
    councilusersModal;
    isModalDismissed = true;
    isTyping = true;
    tagsSet = new Set();
    buttonClicked = true;
    tbottom = '';
    constructor(public platform: Platform, public af: AngularFire, public ele: ElementRef, public modalCtrl: ModalController, public navparams: NavParams, public nav: NavController, public as: AppService, public fs: FirebaseService, private nativeAudio: NativeAudio) {
        // as.getUser().subscribe(user => this.user = user);
        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    fs.getDiscussionByKey(navparams.get('discussion')).subscribe(discussion => {
                        this.discussion = discussion;
                        this.discussion.messages = this.discussion.messages || [];
                        this.discussion.messages = Object.keys(this.discussion.messages).map(e => this.discussion.messages[e]);
                        this.discussion.typings = this.discussion.typings || '';
                        if (this.buttonClicked === false && discussion.lastMsgSentUser !== this.user.firstname + ' ' + this.user.lastname && discussion.isNotificationReq) {
                            this.nativeAudio.play('chime');
                        }
                        fs.getActiveUsersFromCouncil(discussion.councilid).subscribe(users => {
                            this.activeusersCount = users.length;
                        });
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
        this.platform.pause.subscribe(() => {
            this.discussion.typings = this.discussion.typings.replace(', ' + this.user.firstname + ' is typing..', '').replace(this.user.firstname + ' is typing..', '');
            this.fs.updateDiscussion(this.discussion.$key, this.discussion.typings)
                .then(res => {
                    //
                })
                .catch(err => {
                });
        });
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
            this.fs.updateDiscussionChat(this.discussion.$key, chatObj, this.discussion)
                .then(res => {
                    this.tagsSet.forEach(tag => {
                        if (chatObj.text.includes('@' + tag.split('/')[1])) {
                            this.createActivity(this.discussion.$key, tag.split('/')[0], chatObj.text);
                        }
                    });
                    this.tagsSet.clear();
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

    keypresssed($event) {
        // $event.target.value = $event.target.value + ''; //should always be a string
        this.tbottom = this.ele.nativeElement.querySelector('ion-footer').offsetHeight + 'px';
        let start = $event.target.selectionStart;
        if ($event.target.value.includes('@') && $event.target.value.charAt(start - 1) === '@') {

            if (this.isModalDismissed) {
                this.councilusersModal = this.modalCtrl.create(CouncilUsersModalPage, { councilid: this.discussion.councilid });
                this.councilusersModal.onDidDismiss(user => {
                    if (!user) return;
                    this.tagsSet.add(`${user.$key}/${user.firstname}${user.lastname}`);
                    this.msg = `${this.msg}${user.firstname}${user.lastname} `
                    this.isModalDismissed = true;
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
        this.discussion.typings = `${this.discussion.typings}${this.discussion.typings ? ', ' : ''}${this.user.firstname} is typing..`;
        this.fs.updateDiscussion(this.discussion.$key, this.discussion.typings)
            .then(res => {
                //
            })
            .catch(err => {
            });
    }
    focusOut() {
        //username must have been added already in onfoucs event.So, removing it from the typings string
        this.discussion.typings = this.discussion.typings.replace(', ' + this.user.firstname + ' is typing..', '').replace(this.user.firstname + ' is typing..', '');
        this.fs.updateDiscussion(this.discussion.$key, this.discussion.typings)
            .then(res => {
                //
            })
            .catch(err => {
            });
    }

    createActivity(key, userid, msg) {
        let activity = {
            userid: userid,
            entity: 'Discussion',
            entityid: key,
            entityDescription: msg,
            action: 'mentioned',
            councilid: this.discussion.councilid,
            councilname: this.discussion.councilname,
            timestamp: new Date().toISOString(),
            createdUserId: this.user.$key,
            createdUserName: this.user.firstname + ' ' + this.user.lastname,
            createdUserAvatar: this.user.avatar
        }
        this.fs.createActivity(activity);
    }
}
