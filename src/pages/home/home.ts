import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EventMapPage } from '../event-map/event-map'
import { EventListPage } from '../event-list/event-list'
import 'rxjs/add/operator/map';

import { Subscription } from 'rxjs/Subscription'
import { FirebaseProvider } from './../../providers/firebase/firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  mapView = EventMapPage;
  listView = EventListPage;

  
  userName: string;
  userEmail: string;
  subscription: Subscription;

  constructor(public navCtrl: NavController, private firebase: FirebaseProvider) {
    this.subscription = this.firebase.getObject().subscribe(x => {
      this.userName = x.firstName + " " + x.lastName;
      this.userEmail = this.firebase.getUserEmail();
    });
  }
}