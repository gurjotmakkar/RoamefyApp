import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase'
import { Subscription } from 'rxjs/Subscription'
import { UserEventAddPage } from '../user-event-add/user-event-add'
import { UserEventEditPage } from '../user-event-edit/user-event-edit'


@IonicPage()
@Component({
  selector: 'page-user-created-event',
  templateUrl: 'user-created-event.html',
})
export class UserCreatedEventPage {
  userEvents: any[] = [];
  subscription: Subscription;
  userID: string;
  
  constructor(public navCtrl: NavController, private firebase: FirebaseProvider) {
    this.userID = this.firebase.getUserId();
    this.userEvents = [];
    this.subscription = this.firebase.getUserEvents().subscribe(x => {
      this.userEvents = x;
    });
  }

  getCategories(events){
    var categories: string;
    if(events){
      events.forEach( x => {
        if(categories)
          categories += ", " + this.firebase.getInterestName(x);
        else
          categories = this.firebase.getInterestName(x);
      });
      return categories;
    } else {
      return null;
    }
  }  

  addEventPage(){
    this.navCtrl.setRoot(UserEventAddPage)
  }

  editUserEventPage(key){
    this.navCtrl.setRoot(UserEventEditPage, {id: key})
  }

  ngOnDestroy() {
    this.userEvents = [];
    this.subscription.unsubscribe();
  }

}
