import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserEventAddPage } from './user-event-add';

@NgModule({
  declarations: [
    UserEventAddPage
  ],
  imports: [
    IonicPageModule.forChild(UserEventAddPage),
  ],
})
export class UserEventAddPageModule {}
