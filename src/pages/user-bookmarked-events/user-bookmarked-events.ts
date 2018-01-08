import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { SettingsPage } from '../settings/settings';
import { UserEvent } from '../../models/events/userevent.model';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

interface UserNotificationId{
  id: string;
  notificationID: string;
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

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private firebase: FirebaseProvider, private afs: AngularFirestore, 
    public alertCtrl: AlertController) {
    this.userID = this.firebase.getUserId();

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

    this.afs.collection("users").doc(this.userID).collection<UserNotificationId>("bookmarkedEvents")
    .snapshotChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        if(a[i].payload.doc.data().notificationID !== null && a[i].payload.doc.data().notificationID !== undefined)
          this.eventArr.push(a[i].payload.doc.id);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserBookmarkedEventsPage');
  }

  removeEvent(id){
    this.firebase.unbookmarkEvent(id);
  }

  goHome(){
    this.navCtrl.setRoot(SettingsPage)
  }

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

  reminder(item){
    console.log(this.eventArr);
    if(this.checkIfNotificationExists(item.id) == 'notifications-off'){
      const alert = this.alertCtrl.create({
      title: 'Cancel reminder',
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
            this.firebase.cancelNotification(item.id);
            alert.dismiss();
          }
        }]
        });
        alert.present();
      } else {
        const alert = this.alertCtrl.create({
        title: 'Set up a reminder',
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
              if (this.firebase.scheduleNotification(item.id, item.startDate, item.startTime, data.time, item.name)) {
                this.eventArr.push(item.id);
              } else {
                console.log("failed to set reminder");
                alert.dismiss();
                const alert2 = this.alertCtrl.create({
                  title: 'Cannot add reminder',
                  message: 'Cannot add reminder with notification time in the past',
                  buttons: [{
                      text: 'Ok',
                      role: 'Ok',
                      handler: () => {
                          console.log('dismiss alert');
                      }
                      }]
                    });
                alert2.present();
              }
            alert.dismiss();
          }
        }
      ]
      });
      alert.present();
    }
    }
}
