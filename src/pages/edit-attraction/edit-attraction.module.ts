import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditAttractionPage } from './edit-attraction';

@NgModule({
  declarations: [
    EditAttractionPage,
  ],
  imports: [
    IonicPageModule.forChild(EditAttractionPage),
  ],
})
export class EditAttractionPageModule {}
