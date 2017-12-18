import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { TimeDistancePage } from '../time-distance/time-distance';
import { TabsPage } from '../tabs/tabs';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';

interface Interest {
  name: string;
}

interface userInterest {
  name: string;
}

@IonicPage()
@Component({
  selector: 'page-interest',
  templateUrl: 'interest.html',
})

export class InterestPage {

  interestCollection: AngularFirestoreCollection<Interest>;
  interest: any;
  userInterestCollection: AngularFirestoreCollection<userInterest>;
  userInterest: any;
  interestArr: string[] = [];
  userID: string;
  config: false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
      public alertCtrl: AlertController, private afs: AngularFirestore) {
    console.log("in constructor");
    
    this.userID = this.firebase.getUserId();
    this.config = this.firebase.isUserConfigured();

    this.interestCollection = this.afs.collection<Interest>('interest', ref => {
      return ref.orderBy('name')
    });
    this.interest = this.interestCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data() };
        return data;
      });
    });
    
    this.userInterestCollection = this.afs.collection('users').doc(this.userID).collection<userInterest>('userInterest');
    this.userInterest = this.userInterestCollection.valueChanges().forEach(a => {
      this.interestArr = [];
      for ( var i in a )
        this.interestArr.push(a[i].name);
    });
  }

  isChecked(id){
    var checker = false;
    this.interestArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    return checker;
  }

  toggleCheck(id){
    console.log(id)
    if(this.isChecked(id)){
      console.log("uncheck")
      this.afs.collection("interest").doc(id).collection('members').doc(this.userID).delete();
      this.afs.collection("users").doc(this.userID).collection('userInterest').doc(id).delete();
    } else {
      console.log("check")
      this.afs.collection("interest").doc(id).collection('members').doc(this.userID).set({
        name: this.userID
      });
      this.afs.collection("users").doc(this.userID).collection('userInterest').doc(id).set({
        name: id
      });
    }
  }

  isConfigured(){
    console.log(this.config);
    return this.config;
  }

  interestCount(){
    return this.interestArr.length;
  }

  nextSetupPage(){
    if(this.interestCount() == 0){
      this.navCtrl.setRoot(InterestPage);
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
    } else {
      this.navCtrl.setRoot(TimeDistancePage);
    }
  }

  ionViewWillLeave(){
    if(this.interestCount() == 0){
      this.navCtrl.setRoot(InterestPage);
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
    } else {
      console.log("leaving page")
      this.navCtrl.setRoot(TabsPage);
    }
  }
    
  ngOnDestroy() {

  }


}
