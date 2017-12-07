import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimeDistancePage } from './time-distance';

@NgModule({
  declarations: [
    TimeDistancePage,
  ],
  imports: [
    IonicPageModule.forChild(TimeDistancePage),
  ],
})
export class TimeDistancePageModule {}
