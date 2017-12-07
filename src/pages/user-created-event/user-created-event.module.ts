import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCreatedEventPage } from './user-created-event';

@NgModule({
  declarations: [
    UserCreatedEventPage,
  ],
  imports: [
    IonicPageModule.forChild(UserCreatedEventPage),
  ],
})
export class UserCreatedEventPageModule {}
