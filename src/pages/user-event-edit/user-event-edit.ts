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

interface userInterest {
  name: string;
}

//@IonicPage()
@Component({
  selector: 'page-user-event-edit',
  templateUrl: 'user-event-edit.html',
})

export class UserEventEditPage {
  userID: string;
  userInterestCollection: AngularFirestoreCollection<userInterest>;
  userInterest: any;
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
    categories: []
  };
  categories: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
    public alertCtrl: AlertController, private modalCtrl: ModalController, private afs: AngularFirestore) {

    this.userID = this.firebase.getUserId();

    this.eventKey = this.navParams.get('id');

    this.eventDocument = this.afs.collection("events").doc<UserEvent>(this.eventKey);
    this.eventDoc = this.eventDocument.snapshotChanges().map(snap => {
        let id = snap.payload.id;
        let data = { id, ...snap.payload.data() };
        return data;
    });

    this.eventDoc.forEach( e => {
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
        this.categories = e.categories;
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

    this.userInterestCollection = this.afs.collection('users').doc(this.userID).collection<userInterest>('userInterest');
    this.userInterest = this.userInterestCollection.valueChanges().forEach(a => {
      this.interestArr = [];
      for ( var i in a )
        this.interestArr.push(a[i].name);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserEventEditPage');
  }

  checkornot(interestKey){
    var checker = false;
    this.interestArr.forEach(i => {
      if ( i == interestKey )
        checker = true;
    })
    return checker;
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
    modal.onDidDismiss(data => {
      this.event.address = data.description? data.description : "";
      this.event.addressID = data.place_id? data.place_id : "";
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
