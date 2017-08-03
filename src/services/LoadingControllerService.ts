import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';

@Injectable()
export class LoadingControllerService {

    constructor(private loadingCtrl: LoadingController) { }

    getLoadingController() {
        return this.loadingCtrl.create({
            spinner: 'ios'
        });
    }
}
