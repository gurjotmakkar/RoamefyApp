import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { InterestPage } from '../interest/interest';
import { TimeDistancePage } from '../time-distance/time-distance';
import { UserCreatedEventPage } from '../user-created-event/user-created-event'
import { LoginPage } from '../login/login'
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';

interface User {
  role: string;
}

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {
  pages: Array<{title: string, component: any}>;
  userEventPage: {title: string, component: any};
  role: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public firebase: FirebaseProvider, private afs: AngularFirestore) {
    this.pages = [
      { title: "Interests", component: InterestPage },
      { title: "Time and Distance", component: TimeDistancePage }
    ];
    this.userEventPage = { title: "Events by you", component: UserCreatedEventPage };
    
    var userID = this.firebase.getUserId();
    this.afs.collection('users').doc<User>(userID).valueChanges()
    .subscribe(a => {
      this.role = a.role;
    })
  }

  openPage(page) {
    this.navCtrl.setRoot(page.component);
  }

  checkUserRole(){
    console.log(this.role);
    if( this.role == "pro")
      return true;
    return false;
  }

  logout(){
    this.firebase.logoutUser();
    this.navCtrl.setRoot(LoginPage);
  }

}
