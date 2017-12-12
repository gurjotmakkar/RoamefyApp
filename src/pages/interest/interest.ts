
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

  interest: any
  subscription: Subscription;
  userID: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
      public alertCtrl: AlertController) {
    

    this.interest = this.firebase.getInterestList();
    console.log(this.interest);
      this.userID = this.firebase.getUserId();
  }

  checkornot(obj){
    for (var o in obj) {
      console.log(o)
      if(o == this.userID){
        return true;
      }else{
        return false;
      }
    }
  }

  toggleCheck(obj){
    if(this.checkornot(obj)){
      console.log("checked")
      this.firebase.removeInterest(obj.$key);
    } else {
      console.log("unchecked")
      this.firebase.addInterest(obj.$key);
    }
  }

  isConfigured(){
    return this.firebase.isUserConfigured();
  }

  interestCount(){
    var count = 0;
    this.interest.forEach(item => {
        if(this.checkornot(item))
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
