import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EvenUserChatsPage } from './even-user-chats';

@NgModule({
  declarations: [
    EvenUserChatsPage,
  ],
  imports: [
    IonicPageModule.forChild(EvenUserChatsPage),
  ],
})
export class EvenUserChatsPageModule {}
