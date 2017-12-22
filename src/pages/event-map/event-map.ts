import { Component , ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

declare var google: any;
declare var $: any;

@Component({
  selector: 'page-event-map',
  templateUrl: 'event-map.html',
})

export class EventMapPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?limit=500';

  constructor(public navCtrl: NavController, public http: HttpClient, public loading: LoadingController) {}

  ionViewDidLoad(){
    this.setDefaultMap();
    
    let loader = this.loading.create({
      content: "loading...."
    });  
    loader.present();

    this.http.get(this.api)
    .subscribe(data => {
      //this.displayGoogleMap(); // To get current user position
      this.addMarkersMap(data);
    }, err => {
      console.log(err);
    }, () => {
      loader.dismiss();
    });
    
  }

  displayGoogleMap(){
    let locationOptions = {timeout: 20000, enableHighAccuracy: true};
 
    navigator.geolocation.getCurrentPosition(
        (position) => {
            let options = {
              center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            this.map = new google.maps.Map(this.mapElement.nativeElement, options);
        },
        (error) => {
            console.log(error);
        }, locationOptions
    ); 
  }

  setDefaultMap(){
    let latLng = new google.maps.LatLng(43.653908,-79.384293);
    let options = {
      center:latLng,
      zoom:12,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, options);
  }

  addMarkersMap(markers){
    console.log("adding markers");
    console.log(markers.length);
    
    for(let marker of markers)
    { 
      var loc = marker.calEvent.locations[0]["coords"];
      let name  = marker.calEvent["eventName"];
      let webSite = marker.calEvent["eventWebsite"];
      let description = marker.calEvent["description"];
      let orgPhone  = marker.calEvent["orgPhone"];
      let categories = marker.calEvent["categoryString"];
      let img = "http://mnlct.org/wp-content/uploads/2014/10/toronto-skyline.jpg";

      if( marker.calEvent["image"] !== undefined)
        img = "https://secure.toronto.ca" + marker.calEvent["image"]["url"];

      //variable to pass into setContent of infoWindow
      let contentString =              
                    '<div id="iw-container">' +

                    '<div class="iw-title">' + name +'</div>' + 
                    '<div class="iw-content">' +
                    '<div class="iw-subTitle"> Description: </div>' +
                    '<img src= "' + img + '" height="115" width="93">' +
                    '<p>' + description + '</p>' +

                                   '<div class="iw-subTitle">Website: </div>' + '<a href="  '+ webSite +'     ">'  +  'link'     +       '</a>'    +              
                                   '<div class="iw-subTitle">Phone: </div> '   +
                                   '<p>'    + orgPhone    + '</p>'   +                                          
                                   '<div class="iw-subTitle">category(s): </div> '  + 
                                   '<p>' + categories  + '</p>' +
    

                                   '</div>' + //end content
                                   '<div class="iw-bottom-gradient"></div>' +
                                   '</div>' //end container
      //console.log(name); //displays name of each event within this object
   
      marker = new google.maps.Marker({
        position: loc,
        map: this.map,   
      });

      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 350
      }); 

      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(this.map, marker);
        infoWindow.setContent(contentString);   
      });

      google.maps.event.addListener(infoWindow, 'domready', function() {        
                // Reference to the DIV that wraps the bottom of infowindow
                var iwOuter = $('.gm-style-iw');
            
                /* Since this div is in a position prior to .gm-div style-iw.
                 * We use jQuery and create a iwBackground variable,
                 * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
                */

                
                var iwBackground = iwOuter.prev();
            
                // Removes background shadow DIV
                iwBackground.children(':nth-child(2)').css({'display' : 'none'});
            
                // Removes white background DIV
                iwBackground.children(':nth-child(4)').css({'display' : 'none'});
            
                // Moves the infowindow 115px to the right.
                iwOuter.parent().parent().css({left: '20px'});
            
                // Moves the shadow of the arrow 76px to the left margin.
                iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
            
                // Moves the arrow 76px to the left margin.
                iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
            
                // Changes the desired tail shadow color.
                iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});
            
                // Reference to the div that groups the close button elements.
                var iwCloseBtn = iwOuter.next();
            
                // Apply the desired effect to the close button
                iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});
            
                // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
                if($('.iw-content').height() < 140){
                  $('.iw-bottom-gradient').css({display: 'none'});
                }
            
                // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
                iwCloseBtn.mouseout(function(){
                  $(this).css({opacity: '1'});
                });
              });
            }
            
            //google.maps.event.addDomListener(window, 'load', initialize);
       
  }
}