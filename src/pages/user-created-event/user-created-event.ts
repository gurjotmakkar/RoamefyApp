import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase'
import { UserEventAddPage } from '../user-event-add/user-event-add'
import { UserEventEditPage } from '../user-event-edit/user-event-edit'
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { SettingsPage } from '../settings/settings';


@IonicPage()
@Component({
  selector: 'page-user-created-event',
  templateUrl: 'user-created-event.html',
})

export class UserCreatedEventPage {
  eventCollection: AngularFirestoreCollection<UserEvent>;
  events: any;
  userID: string;
  
  constructor(public navCtrl: NavController, private firebase: FirebaseProvider,
    private afs: AngularFirestore) {

    this.userID = this.firebase.getUserId();

    this.eventCollection = this.afs.collection("events", ref => {
      return ref.where('host', '==', this.userID).orderBy('name')
    });

    this.events = this.eventCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data() };
        return data;
      });
    });
  }

  getCategories(events){
    return null;
    /*
    var categories: any;
    if(events){
      events.forEach( x => {
        if(categories)
          categories += ", " + this.firebase.getInterestName(x);
        else
          categories = this.firebase.getInterestName(x);
      });
      return categories;
    } else {
      return null;
    }
    */
  }  

  addEventPage(){
    this.navCtrl.setRoot(UserEventAddPage)
  }

  editUserEventPage(key){
    this.navCtrl.setRoot(UserEventEditPage, {id: key})
  }

  goHome(){
    this.navCtrl.setRoot(SettingsPage);
  }

  ngOnDestroy() {
  }

}
