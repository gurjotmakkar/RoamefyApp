import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

declare var google: any;
/**
 * Generated class for the PlacesViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-places-view',
  templateUrl: 'places-view.html',
})
export class PlacesViewPage {

  autocompleteItems: any;
  geocoder: any;
  GooglePlaces: any;
  nearblyItems: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    //this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    //this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    this.geocoder = new google.maps.Geocoder;
   // this.GooglePlaces = new google.maps.places.nearblySearch;
    this.nearblyItems = [];
  }

  selectSearchResult(item) {
    this.autocompleteItems = [];

    this.geocoder.geocode({'placeId': item.placeId}, (results, status) => {
      if(status === 'OK' && results[0]){
        this.autocompleteItems = [];
        this.GooglePlaces.nearblySearch({
            location: results[0].geometry.location,
            radius: '500',
            types: ['restaurant'],
            key: 'AIzaSyBrqqpoBbtYrhjAnRogxfg8f3FWdydeF00'
        }, (near_places) => {
             //this.zone.run(() => {
                this.nearblyItems = [];
                for(var i = 0; i < near_places.length; i++){
                  this.nearblyItems.push(near_places[i]);
                }
              }); 
        }
      });
  }
//    })
//  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlacesViewPage');
  }

}
