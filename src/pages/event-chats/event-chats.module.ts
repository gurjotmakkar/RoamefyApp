import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventChatsPage } from './event-chats';

@NgModule({
  declarations: [
    EventChatsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventChatsPage),
  ],
})
export class EventChatsPageModule {}
