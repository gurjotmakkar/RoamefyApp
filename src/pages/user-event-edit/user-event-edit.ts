import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase'
import { Subscription } from 'rxjs/Subscription'
import { UserCreatedEventPage } from '../user-created-event/user-created-event'
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AutocompletePage } from '../autocomplete/autocomplete';

interface Interest {
  name: string;
}

@IonicPage()
@Component({
  selector: 'page-user-event-edit',
  templateUrl: 'user-event-edit.html',
})
export class UserEventEditPage {
  eventKey: string;
  interestCollection: AngularFirestoreCollection<Interest>;
  interest: any;
  eventDocument: AngularFirestoreDocument<UserEvent>;
  event: any;
  categories: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
    public alertCtrl: AlertController, private modalCtrl: ModalController, private afs: AngularFirestore, private user: UserEvent) {
    this.eventKey = this.navParams.get('id');
    
    this.eventDocument = this.afs.doc<UserEvent>('event/' + this.eventKey);
    this.event = this.eventDocument.snapshotChanges().map(snap => {
        let id = snap.payload.id;
        let data = { id, ...snap.payload.data() };
        return data;
    });


    this.categories = this.event.categories;

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
  }

  checkornot(interestKey){
    if(this.categories != null){
      this.categories.forEach( x => {
        if (x == interestKey){
          return true;
        }
      })
    }
    return false;
  }

  updateEvent(event: UserEvent, categories) {
    if(this.categories.length > 5){
      //this.navCtrl.setRoot(EditUserEventPage);
      let alert = this.alertCtrl.create({
      message: "Sorry, you can't select more than 5 categories",
      buttons: [
        {
          text: "Ok",
          role: 'cancel'
        }
      ]
    });
    alert.present();
    } else {
    event.categories = categories;
    this.firebase.updateEvent(this.eventKey, event);
    this.navCtrl.setRoot(UserCreatedEventPage)
    }
  }

  showAddressModal (){
    let modal = this.modalCtrl.create(AutocompletePage);
    //let me = this;
    modal.onDidDismiss(data => {
      this.event.address = data;
    });
    modal.present();
  }
  
  removeEvent(event: UserEvent) {
    this.firebase.removeEvent(this.eventKey);
    this.navCtrl.setRoot(UserCreatedEventPage)
  }
  
  cancel(){
    this.navCtrl.setRoot(UserCreatedEventPage)
  }

  ngOnDestroy(){
}

}
