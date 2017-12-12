import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase'
import { Subscription } from 'rxjs/Subscription'
import { UserCreatedEventPage } from '../user-created-event/user-created-event'

@IonicPage()
@Component({
  selector: 'page-user-event-edit',
  templateUrl: 'user-event-edit.html',
})
export class UserEventEditPage {
  eventKey: string;
  event: UserEvent;
  subscription: Subscription;
  interest: any[] = [];
  subscription2: Subscription;
  categories: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider) {
    this.eventKey = this.navParams.get('id');
    this.subscription = this.firebase.getSpecifiedEvent(this.eventKey).subscribe(x => {
      //this.event = x;
    })
    this.categories = this.event.categories;
    this.subscription2 = this.firebase.getInterestList().subscribe(x => {
      this.interest = x;
    });
  }

  checkornot(interestKey){
    if(this.categories != null){
      this.categories.forEach( x => {
        if (x == interestKey){
          return true;
        }
      })
    }
    return false;
  }

  updateEvent(event: UserEvent, categories) {
    event.categories = categories;
    this.firebase.updateEvent(this.eventKey, event);
    this.navCtrl.setRoot(UserCreatedEventPage)
  }

  removeEvent(event: UserEvent) {
    this.firebase.removeEvent(this.eventKey);
    this.navCtrl.setRoot(UserCreatedEventPage)
  }
  
  cancel(){
    this.navCtrl.setRoot(UserCreatedEventPage)
  }

  ngOnDestroy(){
    this.interest = [];
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
}

}
