import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase'
import { Subscription } from 'rxjs/Subscription'
import { UserCreatedEventPage } from '../user-created-event/user-created-event'

@IonicPage()
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
    address: null, // change to Address object TODO: need to add a geocoder to get lat/lon AND auto-complete
    latitude: null,
    longitude: null,
    website: null,
    phone: null,
    host: null,
    categories: []
  };

interest: any[] = [];
categories: any[] = [];
subscription: Subscription;
userID: string;

constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider) {
  this.subscription = this.firebase.getInterestList().subscribe(x => {
    this.interest = x;
  });
  this.userID = this.firebase.getUserId();
 }

ionViewDidLoad() {
  console.log('ionViewDidLoad AddEventPage');
}

addEvent(event: UserEvent, categories) {
  event.categories = categories
  event.host = this.userID;
  this.firebase.addEvent(event);
  this.navCtrl.setRoot(UserCreatedEventPage)
}

cancel(){
  this.navCtrl.setRoot(UserCreatedEventPage)
}

ngOnDestroy() {
  this.interest = [];
  this.subscription.unsubscribe();
}
}
