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
  userID: string;
  eventInterest: any;
  interestArr: string[] = [];
  eventKey: string;
  interestCollection: AngularFirestoreCollection<Interest>;
  interest: any;
  eventDocument: AngularFirestoreDocument<UserEvent>;
  eventDoc: any;
  event: UserEvent = {
    name: null,
    description: null,
    price: 0,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    address: null, 
    addressID: null,
    latitude: null,
    longitude: null,
    website: null,
    phone: null,
    host: null,
    categories: null
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
    public alertCtrl: AlertController, private modalCtrl: ModalController, private afs: AngularFirestore) {

    this.userID = this.firebase.getUserId();

    this.eventKey = this.navParams.get('id');

    this.eventDocument = this.afs.collection("events").doc<UserEvent>(this.eventKey);
    this.eventDoc = this.eventDocument.valueChanges().forEach( e => {
        this.event.id = e.id;
        this.event.address = e.address;
        this.event.addressID = e.addressID;
        this.event.categories = e.categories;
        this.event.description = e.description;
        this.event.endDate = e.endDate;
        this.event.endTime = e.endTime;
        this.event.host = e.host;
        this.event.latitude = e.latitude;
        this.event.longitude = e.longitude;
        this.event.name = e.name;
        this.event.phone = e.phone;
        this.event.price = e.price;
        this.event.startDate = e.startDate;
        this.event.startTime = e.startTime;
        this.event.website = e.website;
    })

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
    var checker = false;
    if(this.event.categories != null)
      this.event.categories.forEach(i => {
        if ( i == interestKey )
          checker = true;
      })
    return checker;
  }

  updateEvent() {
    if(this.event.categories.length > 5 || this.event.categories.length == 0){
      //this.navCtrl.setRoot(EditUserEventPage);
      let alert = this.alertCtrl.create({
      message: "Please select atleas 1 but not more than 5 events",
      buttons: [
        {
          text: "Ok",
          role: 'cancel'
        }
      ]
    });
    alert.present();
    } else {
    this.firebase.updateEvent(this.eventKey, this.event);
    this.navCtrl.setRoot(UserCreatedEventPage);
    }
  }

  showAddressModal (){
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      this.event.address = data === undefined ? null : data.description;
      this.event.addressID = data === undefined ? null : data.place_id;
      this.event.latitude = data === undefined ? null : data.lat;
      this.event.longitude = data === undefined ? null : data.lng;
    });
    modal.present();
  }
  
  removeEvent(event: UserEvent) {
    this.firebase.removeEvent(this.eventKey);
    this.navCtrl.setRoot(UserCreatedEventPage);
  }
  
  cancel(){
    this.navCtrl.setRoot(UserCreatedEventPage);
  }

}
