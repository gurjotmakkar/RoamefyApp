import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-event-list',
  templateUrl: 'event-list.html',
})

export class EventListPage {
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?limit=500';
  eventData: any;

  constructor(public navCtrl: NavController, private http: HttpClient) {}

  ionViewDidLoad(){
    this.http.get(this.api)
    .subscribe(data => {
      this.eventData = data;
    }, err => {
      console.log(err);
    });
  }

}