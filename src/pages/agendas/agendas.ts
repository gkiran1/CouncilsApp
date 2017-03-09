import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';

@Component({
    templateUrl: 'agendas.html',
    selector: 'agendas'
})
export class AgendasPage {

    agendasArray = [];
    constructor(public navCtrl: NavController, public as: AppService, public firebaseservice: FirebaseService) {

        var councilsIds = localStorage.getItem('userCouncils').split(',');
        console.log("councilsIds", councilsIds);

        // councilsIds.forEach(councilId => {
        //     console.log('councilId',councilId);
        //     this.firebaseservice.getAgendasByCouncilId(councilId).subscribe(agendas => {
        //         console.log("agendas", agendas);

        //       //  this.agendasArray.push(agendas[0]);
        //     });
        // });


        councilsIds.forEach(councilId => {
            this.firebaseservice.getAgendas().filter(agendas => {
                return agendas.indexOf(councilId) !== -1;
            }).subscribe(res=>{
                console.log('res',res);
            });
        });
      
    }
}

