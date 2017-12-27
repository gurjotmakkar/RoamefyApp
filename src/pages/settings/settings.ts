import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { InterestPage } from '../interest/interest';
import { TimeDistancePage } from '../time-distance/time-distance';
import { UserCreatedEventPage } from '../user-created-event/user-created-event'
import { AngularFirestore } from 'angularfire2/firestore';
import { EventChatsPage } from '../event-chats/event-chats';
import { UserBookmarkedEventsPage } from '../user-bookmarked-events/user-bookmarked-events';
import { UserProfilePage } from '../user-profile/user-profile';
import { HomePage } from '../home/home';
import { ViewController } from 'ionic-angular/navigation/view-controller';

interface User {
  role: string;
}

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {
  pages: Array<{title: string, component: any}>;
  userEventPage: {title: string, component: any};
  role: string = 'normal';

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public firebase: FirebaseProvider, private afs: AngularFirestore, 
    public viewCtrl: ViewController) {
    this.pages = [
      { title: "Interests", component: InterestPage },
      { title: "Time and Distance", component: TimeDistancePage },
      { title: "Bookmarked Events", component: UserBookmarkedEventsPage },
      { title: "Chatrooms", component: EventChatsPage },
      { title: "User Profile", component: UserProfilePage}
    ];
    this.userEventPage = { title: "Events by you", component: UserCreatedEventPage };
    
    var userID = this.firebase.getUserId();
    this.afs.collection('users').doc<User>(userID).valueChanges()
    .subscribe(a => {
      this.role = a.role == null ? 'normal' : a.role;
    })
  }

  openPage(page) {
    this.navCtrl.setRoot(page.component);
  }

  checkUserRole(){
    if( this.role == "pro")
      return true;
    return false;
  }

  goHome(){
    this.navCtrl.setRoot(HomePage);
  }

  ngOnDestroy() {
    this.viewCtrl.dismiss();
  }
}
