import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { UserEvent } from '../../models/events/userevent.model';

interface Event{
  id: string;
  name: string;
}

interface Member{
  id: string;
  name: string;
}

@Component({
  selector: 'page-event-list',
  templateUrl: 'event-list.html'
})

export class EventListPage {
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?limit=500';
  eventData: any;
  userEventData: any;
  imgLink: string = "https://secure.toronto.ca";
  eventCollection: AngularFirestoreCollection<Event>;
  events: any;
  userEventCollection: AngularFirestoreCollection<Member>;
  userEvents: any;
  userID: string;
  eventArr: string[] = [];

  constructor(public navCtrl: NavController, private http: HttpClient, 
    private firebase: FirebaseProvider, private afs: AngularFirestore,
    public loading: LoadingController) {
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
    this.userEvents = this.userEventCollection.snapshotChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        this.eventArr.push(a[i].payload.doc.id);
    });

    this.userEventData = this.afs.collection<UserEvent>("events").snapshotChanges()
    .map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data() };
        return data;
      })
    });
  }

  ionViewDidLoad(){

    let loader = this.loading.create({
      content: "loading...."
    });  
    loader.present();
    
    this.http.get(this.api)
    .subscribe(data => {
      this.eventData = data;
    }, err => {
      console.log(err);
    }, () => {
      loader.dismiss();
    });
  }

  icon(id){
    var checker = false;
    this.eventArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    if (checker)
      return 'star';
    return 'bookmark';
  }

  addEvent(item){
    console.log(item);
    if( this.icon(item.recId) == 'bookmark' ){
      this.firebase.bookmarkEvent(item, item.recId);
      this.eventArr.push(item.recId);
    } else {
      this.firebase.unbookmarkEvent(item.recId);
      this.eventArr.splice(item.recId);
    }
  }

  addUserEvent(item){
    if( this.icon(item.id) == 'bookmark' ){
      this.firebase.bookmarkUserEvent(item, item.id);
      this.eventArr.push(item.id);
    } else {
      this.firebase.unbookmarkEvent(item.id);
      this.eventArr.splice(item.id);
    }
  }

}