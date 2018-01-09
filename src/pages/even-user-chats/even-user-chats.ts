import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EventChatsPage } from '../event-chats/event-chats';

interface Chat{
  id: string;
  message: string;
  time: Date;
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
  userName: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private firebase: FirebaseProvider, private afs:AngularFirestore) {

    // get attributes sent from previous page
    this.chatKey = this.navParams.get('id');
    this.chatName = this.navParams.get('name');
  
    // getting username
    this.userName = this.firebase.getUserEmail().split('@')[0];

    // get chat messages for the current chatroom
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

    // get list of all username
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

  // on page load
  ionViewDidLoad() {
    console.log('ionViewDidLoad EvenUserChatsPage');
  }

  // format time string to display above message
  formatTime(time){
    return time.toString().substr(16, 5) + ' (' + time.toString().substr(4, 11) + ')';
  }

  // to align username depending on if it is current user or not
  cardTitle(name){
    if(name == this.userName)
      return 'card-title-right';
    else
      return 'card-title-left';
  }

  // to align message depending on if it is current user or not
  cardMessage(name){
    if(name == this.userName)
      return 'card-message-right';
    else
      return 'card-message-left';
  }

  // to align time depending on if it is current user or not
  cardTime(name){
    if(name == this.userName)
      return 'card-time-right';
    else
      return 'card-time-left';
  }

  // push the chat to database
  pushChat(){
    if (this.message !== undefined && this.message != ''){
      this.firebase.pushMessage(this.chatKey, this.message);
      this.message = '';
    }
  }

  // redirect to home
  goHome(){
    this.navCtrl.setRoot(EventChatsPage);
  }
}
