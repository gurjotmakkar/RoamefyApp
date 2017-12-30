import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddAttractionPage } from './add-attraction';

@NgModule({
  declarations: [
    AddAttractionPage,
  ],
  imports: [
    IonicPageModule.forChild(AddAttractionPage),
  ],
})
export class AddAttractionPageModule {}
