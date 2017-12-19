import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpProvider} from '../../providers/http/http'; //importing provider 
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-event-list',
  templateUrl: 'event-list.html',
})

export class EventListPage {
  eventData: any;

  constructor(public navCtrl: NavController, private httpProvider:HttpProvider) {
      this.getdata();
  }

  getdata(){
    this.eventData=JSON.parse(JSON.stringify(this.httpProvider.getJsonData()));
  } 
}