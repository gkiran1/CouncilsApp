import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire } from 'angularfire2';
import { ElementRef } from "@angular/core";

@Component({
  selector: 'page-user-councils',
  templateUrl: 'user-councils.html'
})

export class UserCouncilsModalPage {
  councils = [];
  term: string = '';
  fromPage;
  selectedCouncilObj;
  areaCouncils = []
  stakeCouncils = [];
  wardCouncils = [];
  addedCouncils = [];

  firstShown;

  constructor(private ele: ElementRef, public af: AngularFire, public navParams: NavParams, public fs: FirebaseService, public navCtrl: NavController, public viewCtrl: ViewController) {
    let usercouncils = navParams.get('usercouncils');
    this.selectedCouncilObj = navParams.get('selectedCouncil');
    this.fromPage = navParams.get('fromPage');

    var unitType = localStorage.getItem('unitType');

    usercouncils.forEach(c => {
      fs.getCouncilByCouncilKey(c).subscribe(council => {

        if (this.selectedCouncilObj && council.$key === this.selectedCouncilObj.$key) {
          council['isActCouncil'] = true;
        }
        else {
          council['isActCouncil'] = false;
        }

        if (unitType === 'Area') {
          if (council['under'] === 'Added') {
            this.addedCouncils.push(council);
          }
          else if (council['council'] === 'Stake Presidents') {
            this.stakeCouncils.push(council);
          }
          else {
            this.areaCouncils.push(council);
          }
        }
        else if (unitType === 'Stake') {
          if (council['under'] === 'Added') {
            this.addedCouncils.push(council);
          }
          else if (council['council'] === 'Stake Presidents') {
            this.areaCouncils.push(council);
          }
          else if (council['council'] === 'Bishops') {
            this.wardCouncils.push(council);
          }
          else {
            this.stakeCouncils.push(council);
          }
        }
        else if (unitType === 'Ward') {
          if (council['under'] === 'Added') {
            this.addedCouncils.push(council);
          }
          else if (council['council'] === 'Bishops') {
            this.stakeCouncils.push(council);
          }
          else {
            this.wardCouncils.push(council);
          }
        }

        if (this.areaCouncils.length > 0) {
          this.firstShown = 'Area';
        }
        else if (this.stakeCouncils.length > 0) {
          this.firstShown = 'Stake';
        }
        else if (this.wardCouncils.length > 0) {
          this.firstShown = 'Ward';
        }
        else if (this.addedCouncils.length > 0) {
          this.firstShown = 'Added';
        }

      });
    });
  }

  ionViewDidLoad() {
    //  this.ele.nativeElement.querySelector('.searchbar-input').focus();
  }

  dismiss(council) {
    this.viewCtrl.dismiss(council);
  }

  ngAfterViewInit() {
    this.ele.nativeElement.parentElement.setAttribute("class", this.ele.nativeElement.parentElement.getAttribute("class") + " user-councils-modal")
  }

  searchFn(event) {
    this.term = event.target.value;
  }

}
