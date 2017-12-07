import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HttpProvider} from '../../providers/http/http'; //importing provider 
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-event-list',
  templateUrl: 'event-list.html',
  providers:[HttpProvider]
})

export class EventListPage {
  eventData: any;

  constructor(public navCtrl: NavController,
    public http: HttpClient, private httpProvider:HttpProvider) {
      //this.getdata();
  }

  getdata(){
    this.httpProvider.getJsonData().subscribe(data => {
      this.eventData=JSON.parse(JSON.stringify(data));
      console.log(this.eventData);
    },
    err =>{
      console.error("Error : " +err);
    },
    () => {
      console.log('getData completed');
    });
  } 
}