import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserBookmarkedEventsPage } from './user-bookmarked-events';

@NgModule({
  declarations: [
    UserBookmarkedEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(UserBookmarkedEventsPage),
  ],
})
export class UserBookmarkedEventsPageModule {}
