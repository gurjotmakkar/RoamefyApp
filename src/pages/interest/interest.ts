import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { SettingsPage } from '../settings/settings'
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { HomePage } from '../home/home';

interface Interest {
  name: string;
}

interface userInterest {
  name: string;
}

interface User {
  configured: boolean;
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
  config: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
      public alertCtrl: AlertController, private afs: AngularFirestore, public viewCtrl: ViewController) {
    console.log("in constructor");
    
    // get current user id
    this.userID = this.firebase.getUserId();

    this.afs.collection('users').doc<User>(this.userID).valueChanges()
    .forEach(a => {
      this.config = a.configured == null ? false : a.configured;
    });

    // get the interest collection from firebase database
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
    
    // get user selected interest
    this.userInterestCollection = this.afs.collection('users').doc(this.userID).collection<userInterest>('userInterest');
    this.userInterest = this.userInterestCollection.valueChanges().forEach(a => {
      this.interestArr = [];
      for ( var i in a )
        this.interestArr.push(a[i].name);
    });
  }

  // check if user is configured
  isConfigured(){
    return this.config;
  }

  // check if user is selected the interest using interest id
  isChecked(id){
    var checker = 'interest';
    this.interestArr.forEach(i => {
      if ( i == id )
        checker = 'interestActive';
    })
    return checker;
  }

  // check / uncheck interest
  toggleCheck(id){
    if(this.isChecked(id) == 'interestActive'){
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

  // get interest count
  interestCount(){
    return this.interestArr.length;
  }

  // go to next page
  nextSetupPage(){
    this.firebase.configureUser();
    this.navCtrl.setRoot(HomePage);
  }

  // check if at lease 1 and at most 5 interests are selected before leaving
  ionViewWillLeave(){
    if(this.interestCount() == 0 || this.interestCount() > 5){
      this.navCtrl.setRoot(InterestPage);
      let alert = this.alertCtrl.create({
        message: "Please select at least 1 interests and not more than 5",
        buttons: [
          {
            text: "Ok",
            role: 'cancel'
          }
        ]
      });
      alert.present();
    } else {
      console.log("leaving interest page")

      // redirect to page
        this.navCtrl.setRoot(SettingsPage);
    }
  }

  // redirect to settings page
  goHome(){
    this.navCtrl.setRoot(SettingsPage);
  }
}
