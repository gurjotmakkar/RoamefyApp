import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase'
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { UserCreatedEventPage } from '../user-created-event/user-created-event';

interface Interest {
  name: string;
}

//@IonicPage()
@Component({
  selector: 'page-user-event-add',
  templateUrl: 'user-event-add.html',
})

export class UserEventAddPage {
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
    categories: null,
    categoryString: null
  };
  interestCollection: AngularFirestoreCollection<Interest>;
  interest: any;
  interestArr: string[] = [];
  interestId: string[] = [];
  userID: string;
  categories: any[];
  catString: string = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public alertCtrl: AlertController, private firebase: FirebaseProvider, 
    private afs: AngularFirestore, private modalCtrl: ModalController) {

    // get list of interest
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

    // get user id
    this.userID = this.firebase.getUserId();

    // get interest name and id into arrays
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
    console.log('ionViewDidLoad AddEventPage');
  }

  // add event to the database
  addEvent(event, categories) {
    // check if atlease 1 and atmost 5 categories are selected
    if(this.categories.length > 5 || this.categories.length == 0){
      //this.navCtrl.setRoot(AddEventPage);
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
      event.host = this.userID;

      // creating category string with selected categories
      this.createString(categories);

      event.categoryString = this.catString;

      // add event to database
      this.firebase.addEvent(event);
      this.navCtrl.setRoot(UserCreatedEventPage);
    }
  }

  // creating category string with selected categories
  createString(categories){
    this.catString = null;
    for(var i in categories){
      for(var j in this.interestId){
        if(categories[i] == this.interestId[j]){
          if(this.catString == null )
            this.catString = this.interestArr[j];
          else
            this.catString += ', ' + this.interestArr[j];
        }
      }
    }
  }

  // get address string using autocomplete api
  showAddressModal (){
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      this.event.address = data === undefined ? null : data.description;
      this.event.addressID = data === undefined ? null : data.placeID;
      this.event.latitude = data === undefined ? null : data.lat;
      this.event.longitude = data === undefined ? null : data.lng;
    });
    modal.present();
  }

  // redirect to user created event page
  cancel(){
    this.navCtrl.setRoot(UserCreatedEventPage);
  }
}