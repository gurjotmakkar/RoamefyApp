import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { SettingsPage } from '../settings/settings';

interface Event{
  id: string;
  name: string;
}

@IonicPage()
@Component({
  selector: 'page-user-bookmarked-events',
  templateUrl: 'user-bookmarked-events.html',
})
export class UserBookmarkedEventsPage {

  eventCollection: AngularFirestoreCollection<Event>;
  events: any;
  userID: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private firebase: FirebaseProvider, private afs: AngularFirestore) {
    this.userID = this.firebase.getUserId();

    this.eventCollection = this.afs.collection('users').doc(this.userID).collection<Event>('chatrooms', ref => {
      return ref.orderBy('name')
    });
    this.events = this.eventCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserBookmarkedEventsPage');
  }

  removeEvent(id){
    this.firebase.unbookmarkEvent(id);
  }

  goHome(){
    this.navCtrl.setRoot(SettingsPage)
  }

}
