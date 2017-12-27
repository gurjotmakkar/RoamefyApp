import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-autocomplete',
  templateUrl: 'autocomplete.html',
})
export class AutocompletePage {

  autocompleteItems: any;
  autocomplete: any;
  service: any;
  placesService: any;
  geocoder: any;

  constructor(public viewCtrl: ViewController) {
    this.service = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder;
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
 
  chooseItem(item: any) {
    this.geocoder.geocode({'placeId': item.place_id}, function(results, status) {
      if (status !== 'OK') {
        window.alert('Geocoder failed due to: ' + status);
        return;
      }
      //this.viewCtrl.dismiss(results);
    });

    this.viewCtrl.dismiss(item);
  }
  
  updateSearch() {
    if (this.autocomplete.query == '') {
      this.autocompleteItems = [];
      return;
    }
    let me = this;
    let config = { 
     // types:  ['cities'], // other types available in the API: 'establishment', 'regions', and 'cities'
      input: this.autocomplete.query, 
      componentRestrictions: { country: 'CA' } 
  }
    this.service.getPlacePredictions(config, function (predictions, status) {
      me.autocompleteItems = [];            
      predictions.forEach(function (prediction) {              
          me.autocompleteItems.push(prediction);
      });
  });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AutocompletePage');
  }

}
