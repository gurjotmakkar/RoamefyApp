import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlacesViewPage } from './places-view';

@NgModule({
  declarations: [
    PlacesViewPage,
  ],
  imports: [
    IonicPageModule.forChild(PlacesViewPage),
  ],
})
export class PlacesViewPageModule {}
