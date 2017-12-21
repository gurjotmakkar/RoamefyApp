import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';

interface Event{
  id: string;
  name: string;
}

interface Member{
  name: string;
}

@Component({
  selector: 'page-event-list',
  templateUrl: 'event-list.html'
})

export class EventListPage {
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?limit=500';
  eventData: any;
  imgLink: string = "https://secure.toronto.ca";
  eventCollection: AngularFirestoreCollection<Event>;
  events: any;
  userEventCollection: AngularFirestoreCollection<Member>;
  userEvents: any;
  userID: string;
  eventArr: string[] = [];

  constructor(public navCtrl: NavController, private http: HttpClient, 
    private firebase: FirebaseProvider, private afs: AngularFirestore) {
    this.userID = this.firebase.getUserId();

    this.eventCollection = this.afs.collection<Event>('bookmarkedEvents', ref => {
      return ref.orderBy('name')
    });
    
    this.events = this.eventCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data() };
        return data;
      });
    });
    
    this.userEventCollection = this.afs.collection('users').doc(this.userID).collection<Member>('bookmarkedEvents');
    this.userEvents = this.userEventCollection.valueChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        this.eventArr.push(a[i].name);
    });
  }

  ionViewDidLoad(){
    this.http.get(this.api)
    .subscribe(data => {
      this.eventData = data;
    }, err => {
      console.log(err);
    });
  }

  icon(id){
    var checker = false;
    this.eventArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    if ( checker )
      return 'star';
    return 'bookmark';
  }

  addEvent(item){
    if( this.icon(item.recId) == 'bookmark' ){
      this.firebase.bookmarkEvent(item, this.userID);
      this.eventArr.push(item.recId);
    } else {
      this.firebase.unbookmarkEvent(item.recId);
      this.eventArr.splice(item.recId);
    }
  }

}