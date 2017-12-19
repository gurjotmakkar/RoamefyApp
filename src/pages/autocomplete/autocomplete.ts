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

  constructor(public viewCtrl: ViewController) {
    this.service = new google.maps.places.AutocompleteService();
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
 
  chooseItem(item: any) {
    this.viewCtrl.dismiss(item.description);
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
