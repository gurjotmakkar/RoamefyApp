import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserEventEditPage } from './user-event-edit';

@NgModule({
  declarations: [
    UserEventEditPage,
  ],
  imports: [
    IonicPageModule.forChild(UserEventEditPage),
  ],
})
export class UserEventEditPageModule {}
