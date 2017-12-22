import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';
import { HomePage } from '../home/home';
import { SettingsPage } from '../settings/settings';

interface User{
  configured: boolean;
  distance: number;
  time: number;
}

@IonicPage()
@Component({
  selector: 'page-time-distance',
  templateUrl: 'time-distance.html',
})

export class TimeDistancePage {
  distance: number = 0;
  time: number = 0;
  userID: string;
  userDoc: AngularFirestoreDocument<User>;
  user: any;
  config: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private firebase: FirebaseProvider, public alertCtrl: AlertController, private afs: AngularFirestore) {
    console.log("in time and distance constructor");
    this.userID = this.firebase.getUserId();

    this.afs.collection('users').doc<User>(this.userID).valueChanges()
    .subscribe(a => {
      this.config = a.configured;
    })

    this.userDoc = this.afs.doc<User>('users/' + this.userID);
    this.user = this.userDoc.valueChanges().forEach(a => {
      this.distance = a.distance;
      this.time = a.time;
    });
  }

  updateDistance(distance){
    this.afs.doc("users/" + this.userID)
    .update({
      distance: distance
    });
  }

  updateTime(time){
    this.afs.doc("users/" + this.userID)
    .update({
      time: time
    });
  }

  isConfigured(){
    return this.config;
  }

  finishSetup(){
      this.firebase.configureUser();
      this.navCtrl.setRoot(HomePage);
  }

  goHome(){
    this.navCtrl.setRoot(SettingsPage);
  }
  
  ngOnDestroy() {
    this.userID = null;
}

}
