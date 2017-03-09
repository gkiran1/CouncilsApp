import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../welcome/welcome';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: 'new-blankagenda.html',
  selector: 'new-blankagenda'
})
export class NewBlankAgendaPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  blankagendaForm: FormGroup;
  assignedcouncil: any;
  //This is required to store assingeduser object in UI inorder to fetch related councils.
  usercouncils = [];


  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController) {

    var unitType = localStorage.getItem('unitType')

    this.firebaseservice.getAllCouncils(unitType).subscribe(councils => {
      this.councils = councils;
    });

    this.blankagendaForm = fb.group({
      assignedcouncil: ['', Validators.required],
      assigneddate: [moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), Validators.required],
      assignedtime: ['', Validators.required],
      openinghymn: ['', Validators.required],
      openingprayer: ['', Validators.required],
      spiritualthought: ['', Validators.required],
      highcounselorremarks: ['', Validators.required],
      reviewassignments: ['', Validators.required],
      createdby: '',
      createddate: '',
      isactive: false,
      lastupdateddate: '',
      notes: '',
      isCompleted: false
    });


    appservice.getUser().subscribe(user => {
      console.log("assignedcouncil", this.assignedcouncil);

      let subscribe = this.firebaseservice.getCouncilsByType(user.unittype).subscribe(councils => {
        console.log("user.unittype", user.unittype);
        console.log("councils", councils);

      });
    });
  }

  assignedMemberChange(value) {
    this.users = [];
    this.getUsersByCouncilId(value.assignedcouncil.$key).subscribe(usersObj => {
      usersObj.forEach(usrObj => {
        this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {
          usrs.forEach(usr => {
            this.users.push(usr);
            console.log('this.users', this.users);
          });
        });
      });
    });
  }

  getUsersByCouncilId(councilId: string) {
    return this.firebaseservice.getUsersByCouncil(councilId);
  }

  updateCouncils(councils) {
    councils.usercouncils.forEach(councilid => {
      this.firebaseservice.getUsersByCouncil(councilid).subscribe(usercouncils => this.usercouncils.push(...usercouncils));
      console.log('usercouncils', this.usercouncils);
    });
  }

  agendasArray = [];
  createagenda(agenda) {
    // Main Code
   this.firebaseservice.createAgenda(agenda);

    // var councilsIds = localStorage.getItem('userCouncils').split(',');
    //     console.log("councilsIds", councilsIds);
    
    // councilsIds.forEach(councilId => {

    //   console.log(councilId);
    //   this.firebaseservice.getAgendasByCouncilId(councilId).subscribe(agendas => {
    //     console.log("agendas", agendas);

    //     this.agendasArray.push(agendas[0]);
        
        // console.log("agendasArray", this.agendasArray);
    //   })
    // })
    
  }

  cancel() {
    this.nav.setRoot(WelcomePage);
  }

}
