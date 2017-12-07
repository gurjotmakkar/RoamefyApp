
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { TimeDistancePage } from '../time-distance/time-distance';
import { Subscription } from 'rxjs/Subscription'

@IonicPage()
@Component({
  selector: 'page-interest',
  templateUrl: 'interest.html',
})
export class InterestPage {

  interest: any[] = [];
  subscription: Subscription;
  userID: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
      public alertCtrl: AlertController) {
    this.subscription = this.firebase.getInterestList().subscribe(x => {
      this.interest = x;
    });
      this.userID = this.firebase.getUserId();
  }

  checkornot(members){
    for (var member in members) {
      if(member == this.userID){
        return true;
      }else{
        return false;
      }
    }
  }

  toggleCheck(members, key){
    if(this.checkornot(members)){
      console.log("checked")
      this.firebase.removeInterest(this.userID, key);
    } else {
      console.log("unchecked")
      this.firebase.addInterest(this.userID, key);
    }
  }

  isConfigured(){
    return this.firebase.isUserConfigured(this.userID);
  }

  interestCount(){
    var count = 0;
    this.interest.forEach(item => {
        if(this.checkornot(item.members))
          count++;
    })
    return count;
  }

  nextSetupPage(){
    if(this.interestCount() >= 1){
      this.navCtrl.setRoot(TimeDistancePage);
    }else {
      let alert = this.alertCtrl.create({
      message: "Please select at least 1 interests",
      buttons: [
        {
          text: "Ok",
          role: 'cancel'
        }
      ]
    });
    alert.present();
    }
  }

  ionViewWillLeave(){
    if(this.interestCount() >= 1){
      console.log("leaving page")
    } else {
      this.navCtrl.setRoot(TimeDistancePage);
      let alert = this.alertCtrl.create({
        message: "Please select at least 1 interests",
        buttons: [
          {
            text: "Ok",
            role: 'cancel'
          }
        ]
      });
      alert.present();
    }
  }
    
  ngOnDestroy() {
    this.interest = [];
    this.subscription.unsubscribe();
  }


}
