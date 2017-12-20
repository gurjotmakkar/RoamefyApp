import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { UserEvent } from '../../models/events/userevent.model';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { UserCreatedEventPage } from '../user-created-event/user-created-event';

interface Interest {
  name: string;
}

//@IonicPage()
@Component({
  selector: 'page-user-event-edit',
  templateUrl: 'user-event-edit.html',
})

export class UserEventEditPage {

  eventKey: string;
  interestCollection: AngularFirestoreCollection<Interest>;
  interest: any;
  eventDocument: AngularFirestoreDocument<UserEvent>;
  event: UserEvent = {
    name: null,
    description: null,
    price: 0,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    address: null, 
    latitude: null,
    longitude: null,
    website: null,
    phone: null,
    host: null,
    categories: []
  };
  categories: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
    public alertCtrl: AlertController, private modalCtrl: ModalController, private afs: AngularFirestore) {

    this.eventKey = this.navParams.get('id');
    
    this.eventDocument = this.afs.doc('event/' + this.eventKey);
    this.eventDocument.snapshotChanges().map(snap => {
        this.event.id = snap.payload.id;

        let data = snap.payload.data();
        this.event.address = data.address;
        this.event.categories = data.categories;
        this.event.description = data.description;
        this.event.endDate = data.endDate;
        this.event.endTime = data.endTime;
        this.event.host = data.host;
        this.event.latitude = data.latitude;
        this.event.longitude = data.longitude;
        this.event.name = data.name;
        this.event.phone = data.phone;
        this.event.price = data.price;
        this.event.startDate = data.startDate;
        this.event.startTime = data.startTime;
        this.event.website = data.website;
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserEventEditPage');
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
    this.navCtrl.setRoot(UserCreatedEventPage);
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
    this.navCtrl.setRoot(UserCreatedEventPage);
  }
  
  cancel(){
    this.navCtrl.pop();
  }

}
