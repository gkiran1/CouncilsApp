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
  selectedCouncil;
  constructor(private ele: ElementRef, public af: AngularFire, public navParams: NavParams, public fs: FirebaseService, public navCtrl: NavController, public viewCtrl: ViewController) {
    let usercouncils = navParams.get('usercouncils');
    let selectedCouncilObj = navParams.get('selectedCouncil');
    this.fromPage = navParams.get('fromPage');
    usercouncils.forEach(c => {
      fs.getCouncilByCouncilKey(c).subscribe(council => {
        this.councils.push(council);
        if (selectedCouncilObj && council.$key === selectedCouncilObj.$key) this.selectedCouncil = council;
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserCouncilsPage');
    this.ele.nativeElement.querySelector('.searchbar-input').focus();
  }
  dismiss(council) {
    this.viewCtrl.dismiss(council);
  }
  ngAfterViewInit() {
    this.ele.nativeElement.parentElement.setAttribute("class", this.ele.nativeElement.parentElement.getAttribute("class") + " user-councils-modal")
  }
  searchFn(event) {
    this.term = event.target.value;
    console.log('search', event.target.value);
  }

}
