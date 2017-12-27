import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserProfileEditProPage } from './user-profile-edit-pro';

@NgModule({
  declarations: [
    UserProfileEditProPage,
  ],
  imports: [
    IonicPageModule.forChild(UserProfileEditProPage),
  ],
})
export class UserProfileEditProPageModule {}
