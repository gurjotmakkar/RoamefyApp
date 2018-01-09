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
  //calID: string;
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
  //calArr: string[] = [];

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

    /*
    // remove notificationID if notification is done
    this.afs.collection("users").doc(this.userID).collection<UserNotificationId>("bookmarkedEvents")
    .snapshotChanges()
    .take(1)
    .forEach(a => {
      for ( var i in a )
        if(a[i].payload.doc.data().time !== null && a[i].payload.doc.data().time !== undefined){
          var now = new Date();
          var t = new Date(a[i].payload.doc.data().time);
          if(t.valueOf() >= now.valueOf())
            this.firebase.cancelNotification(this.userID, a[i].payload.doc.id);
        }
    });
    */

    // get list of events for which notification is scheduled
    this.afs.collection("users").doc(this.userID).collection<UserNotificationId>("bookmarkedEvents")
    .snapshotChanges()
    .forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        if(a[i].payload.doc.data().notificationID !== null && a[i].payload.doc.data().notificationID !== undefined)
          this.eventArr.push(a[i].payload.doc.id);
    });

    /*
    // get list of events for which calendar is scheduled
    this.afs.collection("users").doc(this.userID).collection<UserNotificationId>("bookmarkedEvents")
    .snapshotChanges().forEach(a => {
      this.calArr = [];
      for ( var i in a )
        if(a[i].payload.doc.data().calID !== null && a[i].payload.doc.data().calID !== undefined)
          this.calArr.push(a[i].payload.doc.id);
    });
    */
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

  /*
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
  */

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
            this.firebase.cancelNotification(this.userID, item.id);
            this.eventArr.splice(item.id);
            //alert.dismiss();
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
              var a = this.firebase.scheduleNotification(this.userID, item.id, item.startDate, item.startTime, data.time, item.name);
              if(a)
                this.eventArr.push(item.id);
              //alert.dismiss();
            }
          }]
      });
      alert.present();
    }
  }

  // set calendar event on user's device calendar app
  scheduleCalendar(item){
    const alert = this.alertCtrl.create({
      title: 'Set up a calendar event',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Set Calendar Event',
          handler: data => {
            var start;
            var end;

            if(item.startTime == null || item.startTime == "" || item.startTime === undefined)
              start = new Date(item.startDate + 'T' + "09:00");
            else
              start = new Date(item.startDate + 'T' + item.startTime);

            if(item.endTime == null || item.endTime == "" || item.endTime === undefined)
              end = new Date(item.endDate + 'T' + "09:00");
            else
              end = new Date(item.endDate + 'T' + item.endTime);

            this.calendar.createEvent(item.name, item.address, item.website, start, end).then(
              (msg) => { console.log(msg); },
              (err) => { console.log(err); }
            );

            alert.dismiss();
            }
        }]
    });
    alert.present();
  }


  /*
  // set / remove a calendar for an events for a user
  scheduleCalendar(item){
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

            var start;
            var end;

            if(item.startTime == null || item.startTime == "" || item.startTime === undefined)
              start = new Date(item.startDate + 'T' + "09:00");
            else
              start = new Date(item.startDate + 'T' + item.startTime);

            if(item.endTime == null || item.endTime == "" || item.endTime === undefined)
              end = new Date(item.endDate + 'T' + "09:00");
            else
              end = new Date(item.endDate + 'T' + item.endTime);

            this.calendar.createEvent(item.name, item.address, item.website, start, end).then(
              (msg) => { console.log(msg); },
              (err) => { console.log(err); }
            );

            alert.dismiss();
          }
        }]
        });
        alert.present();
      } else {
        const alert = this.alertCtrl.create({
        title: 'Set up a calendar event',
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
            text: 'Set in Calendar',
            handler: data => {
              this.calArr.push(item.id);

              var start;
              var end;
  
              if(item.startTime == null || item.startTime == "" || item.startTime === undefined)
                start = new Date(item.startDate + 'T' + "09:00");
              else
                start = new Date(item.startDate + 'T' + item.startTime);
  
              if(item.endTime == null || item.endTime == "" || item.endTime === undefined)
                end = new Date(item.endDate + 'T' + "09:00");
              else
                end = new Date(item.endDate + 'T' + item.endTime);

              this.calendar.createEvent(item.name, item.address, item.website, start, end).then(
                (msg) => { console.log(msg); },
                (err) => { console.log(err); }
              );

              alert.dismiss();
              }
          }]
      });
      alert.present();
    }
  }
  */
}
