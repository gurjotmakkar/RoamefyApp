import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EventChatsPage } from '../event-chats/event-chats';

interface Chat{
  id: string;
  message: string;
  time: string;
  userID: string;
  userName: string;
}

interface User{
  id: string;
  firstName: string;
  lastName: string;
}

@IonicPage()
@Component({
  selector: 'page-even-user-chats',
  templateUrl: 'even-user-chats.html'
})

export class EvenUserChatsPage {
  chatKey: string;
  chatName: string;
  chatCollection: AngularFirestoreCollection<Chat>;
  chats: any;
  userCollection: AngularFirestoreCollection<User>;
  users: any;
  message: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private firebase: FirebaseProvider, private afs:AngularFirestore) {
    this.chatKey = this.navParams.get('id');
    this.chatName = this.navParams.get('name');
  
    this.chatCollection = this.afs.collection('chatrooms').doc(this.chatKey).collection<Chat>('chats', ref => {
      return ref.orderBy('time', 'desc')
    });
    this.chats = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data() };
        return data;
      });
    });

    this.userCollection = this.afs.collection<User>('users', ref => {
      return ref.orderBy('name')
    });
    this.users = this.userCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data() };
        return data;
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EvenUserChatsPage');
  }

  pushChat(){
    if (this.message !== undefined && this.message != ''){
      this.firebase.pushMessage(this.chatKey, this.message);
      this.message = '';
    }
  }

  goHome(){
    this.navCtrl.setRoot(EventChatsPage);
  }
}
