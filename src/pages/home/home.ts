import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { EventMapPage } from '../event-map/event-map'
import { EventListPage } from '../event-list/event-list'
import 'rxjs/add/operator/map';
import { SettingsPage } from '../settings/settings';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { LoginPage } from '../login/login';
import { PlacesViewPage } from '../places-view/places-view';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  mapView = EventMapPage;
  listView = EventListPage;
  placesView = PlacesViewPage;
  constructor(public navCtrl: NavController, private firebase: FirebaseProvider) {}

  goToMore(){
    this.navCtrl.setRoot(SettingsPage);
  }

  logout(){
    this.navCtrl.setRoot(LoginPage);
    this.firebase.logoutUser();
  }
}