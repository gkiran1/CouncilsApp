import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';


@Injectable()
export class LoadingControllerService {
    loadingController: any;

    constructor(private loadingCtrl: LoadingController) {
        this.loadingController = this.loadingCtrl.create({           
        });
    }
}
