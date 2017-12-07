import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventMapPage } from './event-map';

@NgModule({
  declarations: [
    EventMapPage,
  ],
  imports: [
    IonicPageModule.forChild(EventMapPage),
  ],
})
export class EventMapPageModule {}
