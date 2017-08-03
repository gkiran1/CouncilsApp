import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { NavController } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { InviteAdminPage } from '../invite-admin/invite-admin.component'
@Component({
    selector: 'page-success',
    templateUrl: 'success.html'
})
export class InviteAdminSuccessPage {

    constructor(public appservice: AppService, public navctrl: NavController, public af: AngularFire) {

    }

    inviteanother() {
        this.navctrl.push(InviteAdminPage);
    }

    close() {
        this.navctrl.popToRoot({ animate: true, animation: 'transition', direction: 'back' });
    }
}