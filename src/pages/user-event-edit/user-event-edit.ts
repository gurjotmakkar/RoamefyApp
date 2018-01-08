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
  interestId: string[] = [];
  eventKey: string;
  interestCollection: AngularFirestoreCollection<Interest>;
  interest: any;
  eventDocument: AngularFirestoreDocument<UserEvent>;
  eventDoc: any;
  event: UserEvent = {
    id: null,
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
    categories: null,
    categoryString: null
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider,
    public alertCtrl: AlertController, private modalCtrl: ModalController, private afs: AngularFirestore) {

    // get user id
    this.userID = this.firebase.getUserId();

    // get event id from previous page
    this.eventKey = this.navParams.get('id');

    // get other field values where event id = eventKey
    this.eventDocument = this.afs.collection("events").doc<UserEvent>(this.eventKey);
    this.eventDoc = this.eventDocument.valueChanges().take(1).forEach( e => {
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
    });

    // get list of interests
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

    // push interest id and name into arrays
    this.afs.collection<Interest>('interest').snapshotChanges()
    .forEach(i => {
      i.forEach(a => {
        this.interestId.push(a.payload.doc.id);
        this.interestArr.push(a.payload.doc.data().name);
      })
    })

  }

  // on page load
  ionViewDidLoad() {
    console.log('ionViewDidLoad UserEventEditPage');
  }

  // check if the interest is selected by user
  checkornot(interestKey){
    var checker = false;
    if(this.event.categories != null)
      this.event.categories.forEach(i => {
        if ( i == interestKey )
          checker = true;
      })
    return checker;
  }

  // update event
  updateEvent() {
    // check if atleast 1 and atmost 5 interests are selected
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
      this.event.categoryString = this.createString(this.event.categories);
      this.firebase.updateEvent(this.eventKey, this.event);
      this.navCtrl.setRoot(UserCreatedEventPage);
    }
  }

  // create string from selected interests
  createString(categories){
    var catString = null;
    for(var i in categories){
      for(var j in this.interestId){
        if(categories[i] == this.interestId[j]){
          if(catString == null )
            catString = this.interestArr[j];
          else
            catString += ', ' + this.interestArr[j];
        }
      }
    }
    return catString;
  }

  // get address string using autocomplete api
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
  
  // remove event from database
  removeEvent(event: UserEvent) {
    this.firebase.removeEvent(this.eventKey);
    this.navCtrl.setRoot(UserCreatedEventPage);
  }
  
  // redirect to user created events page
  cancel(){
    this.navCtrl.setRoot(UserCreatedEventPage);
  }

}
