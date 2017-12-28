import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs';

declare var google: any;

interface geoData{
  lat: string;
  lng: string;
  placeID: string;
  description: string;
}

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
  lat: Array<string> = [];
  obj: geoData = {
    lat: null,
    lng: null,
    placeID: null,
    description: null
  }

  constructor(public viewCtrl: ViewController) {
    this.service = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
 
  chooseItem(item: any) {
    var ob = Observable.create(observer => {
      this.geocoder.geocode({'placeId': item.place_id}, function(results, status) {
        if (status == 'OK') {
          observer.next(results[0].geometry.location.lng());
          observer.next(results[0].geometry.location.lat());
          observer.complete();
        }
      });
    });
  
    ob.subscribe(o => {
      this.lat.push(o);
      this.obj.lng = this.lat[0];
      this.obj.lat = this.lat[1];
      this.obj.placeID = item.place_id;
      this.obj.description = item.description;
    },
      e => {console.log('Error:', e)},
      () => {
        console.log('Completed');
        this.viewCtrl.dismiss(this.obj);
      }
    );
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
