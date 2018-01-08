import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EvenUserChatsPage } from '../even-user-chats/even-user-chats';
import { SettingsPage } from '../settings/settings';

interface Chat{
  id: string;
  name: string;
}

@IonicPage()
@Component({
  selector: 'page-event-chats',
  templateUrl: 'event-chats.html',
})
export class EventChatsPage {

  chatCollection: AngularFirestoreCollection<Chat>;
  chats: any;
  userID: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private firebase: FirebaseProvider, private afs: AngularFirestore) {
    this.userID = this.firebase.getUserId();

    // get list of chatrooms current user is assigned to
    this.chatCollection = this.afs.collection('users').doc(this.userID).collection<Chat>('chatrooms', ref => {
      return ref.orderBy('name')
    });
    this.chats = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
  }

  // on page load
  ionViewDidLoad() {
    console.log('ionViewDidLoad EventChatsPage');
  }

  // open the clicked chat
  openChat(key, name){
    this.navCtrl.setRoot(EvenUserChatsPage, {id: key, name: name})
  }

  // redirect to settings page
  goHome(){
    this.navCtrl.setRoot(SettingsPage);
  }

}
