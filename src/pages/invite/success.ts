import { Component } from '@angular/core';
import {AppService} from '../../providers/app-service';
import { NavController } from 'ionic-angular';
import { InviteMemberPage } from './invite';

@Component({
    templateUrl: 'success.html'
})
export class InvitationSuccessPage{
    userObj;
    constructor(public appservice:AppService, public navctrl:NavController){
        this.userObj = appservice.user;
    }
    inviteanother(){
        this.navctrl.push(InviteMemberPage);
    }
}