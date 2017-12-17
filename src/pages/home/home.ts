import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { EventMapPage } from '../event-map/event-map'
import { EventListPage } from '../event-list/event-list'
import 'rxjs/add/operator/map';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  mapView = EventMapPage;
  listView = EventListPage;

  constructor(public navCtrl: NavController) {}
}