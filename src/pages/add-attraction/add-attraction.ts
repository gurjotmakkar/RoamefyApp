import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Attractions } from '../../models/attractions/attractions.model';
import { SettingsPage } from '../settings/settings';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AutocompletePage } from '../autocomplete/autocomplete';

@IonicPage()
@Component({
  selector: 'page-add-attraction',
  templateUrl: 'add-attraction.html',
})
export class AddAttractionPage {

  attraction: Attractions = {
    name: null,
    description: null,
    address: null, 
    addressID: null,
    latitude: null,
    longitude: null,
    website: null,
    phone: null,
    hours: null
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private firebase: FirebaseProvider, private modalCtrl: ModalController) {}

  // load page
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddAttractionPage');
  }

  // add the attraction to database
  addattraction(attraction) {
      this.firebase.addAttraction(attraction);
      this.navCtrl.setRoot(SettingsPage);
  }
  
  // get address string from autocomplete api
  showAddressModal (){
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      this.attraction.address = data === undefined ? null : data.description;
      this.attraction.addressID = data === undefined ? null : data.placeID;
      this.attraction.latitude = data === undefined ? null : data.lat;
      this.attraction.longitude = data === undefined ? null : data.lng;
    });
    modal.present();
  }
  
  // redirect to settings page
  cancel(){
    this.navCtrl.setRoot(SettingsPage);
  }
}
