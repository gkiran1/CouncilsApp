import { Injectable } from '@angular/core';
import { Network } from 'ionic-native';
import { Platform } from 'ionic-angular';
 
declare var Connection;
 
@Injectable()
export class ConnectivityService {
 
  onDevice: boolean;
 
  constructor(public platform: Platform){
    this.onDevice = this.platform.is('cordova') || this.platform.is('ios') || this.platform.is('android');
  }
 
  isOnline(): boolean {
    console.log(this.onDevice);
    if(this.onDevice && Network.type){
      console.log('Online' + Network.type);
      return Network.type !== Connection.NONE;
    } else {
      return navigator.onLine; 
    }
  }
 
  isOffline(): boolean {
    if(this.onDevice && Network.type){
      console.log('Offline' + Network.type);
      return Network.type === Connection.NONE;
    } else {
      return !navigator.onLine;   
    }
  }
}