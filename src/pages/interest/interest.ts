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

  interest: any[];
  interestID: any[];
  userInterest: any[];
  subscription: Subscription;
  subscription2: Subscription;
  userID: string;
  config: false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
      public alertCtrl: AlertController) {
    console.log("in constructor");

    var names = [];
    var ids = [];
    var ints = [];

    this.subscription = this.firebase.getInterestList().subscribe(a => {
      a.forEach(b => {
      names.push(b.payload.doc.data());
      ids.push(b.payload.doc.id);
    });
    },
    err => {
      console.log(err);
    },
    () => {
      console.log("complete!");
    });

    this.subscription2 = this.firebase.getUserInterestList().subscribe(a => {
      a.forEach(b => {
        ints.push(b.payload.doc.id);
    });
    },
    err => {
      console.log(err);
    },
    () => {
      console.log("complete!");
    });

    this.userInterest = ints;
    this.interest = names;
    this.interestID = ids;
    this.userID = this.firebase.getUserId();
    this.config = this.firebase.isUserConfigured();
  }

  checkornot(item){
    console.log(item.name);
    var ind = this.userInterest.findIndex(item);
    console.log(ind)
    if (this.userInterest.find(this.interestID[ind]) != undefined)
      return true;
    return false;
  }

  toggleCheck(item){
    if(this.checkornot(item)){
      console.log("checked")
      this.firebase.removeInterest(item.$key);
    } else {
      console.log("unchecked")
      this.firebase.addInterest(item.$key);
    }
  }

  isConfigured(){
    return this.config;
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
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }


}
