import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { SettingsPage } from '../settings/settings';
import { UserEvent } from '../../models/events/userevent.model';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Calendar } from '@ionic-native/calendar';

interface UserNotificationId{
  id: string;
  notificationID: string;
  calID: string;
}

@IonicPage()
@Component({
  selector: 'page-user-bookmarked-events',
  templateUrl: 'user-bookmarked-events.html',
})
export class UserBookmarkedEventsPage {

  eventCollection: AngularFirestoreCollection<UserEvent>;
  events: any;
  userID: string;
  time: number;
  eventArr: string[] = [];
  calArr: string[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private firebase: FirebaseProvider, private afs: AngularFirestore, 
    public alertCtrl: AlertController, private calendar: Calendar) {
    
    // get user id
    this.userID = this.firebase.getUserId();

    // get list of events bookmarked by user
    this.eventCollection = this.afs.collection('users').doc(this.userID).collection<UserEvent>('bookmarkedEvents', ref => {
      return ref.orderBy('name')
    });
    this.events = this.eventCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });

    // get list of events for which notification is scheduled
    this.afs.collection("users").doc(this.userID).collection<UserNotificationId>("bookmarkedEvents")
    .snapshotChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        if(a[i].payload.doc.data().notificationID !== null && a[i].payload.doc.data().notificationID !== undefined)
          this.eventArr.push(a[i].payload.doc.id);
    });

    // get list of events for which calendar is scheduled
    this.afs.collection("users").doc(this.userID).collection<UserNotificationId>("bookmarkedEvents")
    .snapshotChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        if(a[i].payload.doc.data().calID !== null && a[i].payload.doc.data().calID !== undefined)
          this.calArr.push(a[i].payload.doc.id);
    });
  }

  // on page load
  ionViewDidLoad() {
    console.log('ionViewDidLoad UserBookmarkedEventsPage');
  }

  // remove bookmark
  removeEvent(id){
    this.firebase.unbookmarkEvent(id);
  }

  // redirects to settings page
  goHome(){
    this.navCtrl.setRoot(SettingsPage)
  }

  // check if notification is scheduled for an event
  checkIfNotificationExists(id){
    var checker = false;
    this.eventArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    if (checker)
      return 'notifications-off';
    return 'notifications';
  }

  // check if calendar is scheduled for an event
  checkIfCalendarExists(id){
    var checker = false;
    this.calArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    if (checker)
      return 'calendar';
    return 'browsers';
  }

  // set / remove a reminder for an events for a user
  reminder(item){
    console.log(this.eventArr);
    if(this.checkIfNotificationExists(item.id) == 'notifications-off'){
      const alert = this.alertCtrl.create({
      title: 'Cancel notification reminder',
      message: 'Do you want cancel the reminder?',
      buttons: [{
          text: 'No',
          role: 'No',
          handler: () => {
              console.log('Application exit prevented!');
          }
      },{
          text: 'Yes',
          handler: () => {
            this.eventArr.splice(item.id);
            this.firebase.cancelNotification(this.userID, item.id);
            alert.dismiss();
          }
        }]
        });
        alert.present();
      } else {
        const alert = this.alertCtrl.create({
        title: 'Set up a notification reminder',
        inputs: [
          {
            name: 'time',
            placeholder: 'HH (hours in numbers)'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Remind Me',
            handler: data => {
              this.firebase.scheduleNotification(this.userID, item.id, item.startDate, item.startTime, data.time, item.name);
              this.eventArr.push(item.id);
              alert.dismiss();
              }
          }]
      });
      alert.present();
    }
  }

  // set / remove a calendar for an events for a user
  scheduleCalendar(item){
    console.log(this.eventArr);
    if(this.checkIfCalendarExists(item.id) == 'calendar'){
      const alert = this.alertCtrl.create({
      title: 'Cancel calendar reminder',
      message: 'Do you want remove reminder?',
      buttons: [{
          text: 'No',
          role: 'No',
          handler: () => {
              console.log('Application exit prevented!');
          }
      },{
          text: 'Yes',
          handler: () => {
            this.calArr.splice(item.id);
/*
            var start = new Date(item.startDate + 'T' + (item.startTime == ));
            var end = new Date(item.startDate + 'T' + item.startTime)

            this.calendar.createEvent(item.name, item.address, item.website, item.startDate + 'T' + item.startTime, item.endDate).then(
              (msg) => { console.log(msg); },
              (err) => { console.log(err); }
            );
*/
            //this.firebase.cancelNotification(item.id);
            alert.dismiss();
          }
        }]
        });
        alert.present();
      } else {
        const alert = this.alertCtrl.create({
        title: 'Set up a calendar reminder',
        inputs: [
          {
            name: 'time',
            placeholder: 'HH (hours in numbers)'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Remind Me',
            handler: data => {
              this.calArr.push(item.id);


              //this.firebase.scheduleNotification(item.id, item.startDate, item.startTime, data.time, item.name);
              alert.dismiss();
              }
          }]
      });
      alert.present();
    }
  }
}
