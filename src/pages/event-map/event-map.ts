import { Component , ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase';

declare var google: any;
//declare var $: any;

interface Member{
  id: string;
  name: string;
}

@Component({
  selector: 'page-event-map',
  templateUrl: 'event-map.html',
})

export class EventMapPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?limit=500';
  userEventCollection: AngularFirestoreCollection<Member>;
  userEvents: any;
  userID: string;
  eventArr: string[] = [];

  constructor(public navCtrl: NavController, public http: HttpClient, 
    public loading: LoadingController, private afs: AngularFirestore,
    private firebase: FirebaseProvider) {
      
    this.userID = this.firebase.getUserId();
    
    this.userEventCollection = this.afs.collection('users').doc(this.userID).collection<Member>('bookmarkedEvents');
    this.userEvents = this.userEventCollection.snapshotChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        this.eventArr.push(a[i].payload.doc.id);
    });
    }

  ionViewDidLoad(){
    this.setDefaultMap();
    //this.displayGoogleMap(); // To get current user position
    
    let loader = this.loading.create({
      content: "loading...."
    });  
    loader.present();
    
    this.http.get(this.api)
    .subscribe(data => {
      this.addMarkersMap(data);
    }, err => {
      console.log(err);
    }, () => { 
      loader.dismiss();
    });

    this.afs.collection<UserEvent>("events").snapshotChanges()
    .forEach(event => {
      event.forEach(e => {
        this.addUserEventMarkersMap(e.payload.doc.data(), e.payload.doc.id);
      })
    })
    
  }

  displayGoogleMap(){
    let locationOptions = {timeout: 20000, enableHighAccuracy: true};
 
    navigator.geolocation.getCurrentPosition(
        (position) => {
            let options = {
              center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
              zoom: 12,
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

  icon(id){
    var checker = false;
    this.eventArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    return checker
  }

  addEvent(lat, lng, startDate, startTime, endDate, endTime, name,
    price, webSite, description, orgPhone, orgAddress, categories, id){
    if(!this.icon(id)){
      this.firebase.bookmarkEvent(lat, lng, startDate, startTime, endDate, endTime, name,
        price, webSite, description, orgPhone, orgAddress, categories, id);
      this.eventArr.push(id);
    } else {
      this.firebase.unbookmarkEvent(id);
      this.eventArr.splice(id);
    }
  }

  addMarkersMap(markers){
    console.log(markers.length);
    
    for(let marker of markers) { 
      let del = "";
      let id = marker.calEvent["recId"];
      let loc = marker.calEvent.locations[0]["coords"] === undefined ? (marker.calEvent.locations[0]["coords"][0] === undefined ? "" : marker.calEvent.locations[0]["coords"][0]) : marker.calEvent.locations[0]["coords"];
      let lat = marker.calEvent.locations[0]["coords"].lat === undefined ? (marker.calEvent.locations[0]["coords"][0].lat === undefined ? "" : marker.calEvent.locations[0]["coords"][0].lat) : marker.calEvent.locations[0]["coords"].lat;
      let lng = marker.calEvent.locations[0]["coords"].lng === undefined ? (marker.calEvent.locations[0]["coords"][0].lng === undefined ? "" : marker.calEvent.locations[0]["coords"][0].lng) : marker.calEvent.locations[0]["coords"].lng;
      let startDate = marker.calEvent["startDate"].substr(0,10);
      let startTime = marker.calEvent["startDateTime"] === undefined || marker.calEvent["startDateTime"] === null ? "Time is not available" : marker.calEvent["startDateTime"].substr(11,5);
      if(marker.calEvent["startDateTime"] === undefined || marker.calEvent["startDateTime"] === null){
        marker.calEvent["endDateTime"] = "";
        del = "";
      }
      let endDate = marker.calEvent["endDate"].substr(0,10);
      let endTime = marker.calEvent["endDateTime"]  === undefined || marker.calEvent["endDateTime"] === null ? "" : marker.calEvent["endDateTime"].substr(11,5);
      if(marker.calEvent["endDateTime"]  === undefined || marker.calEvent["endDateTime"] === null || marker.calEvent["endDateTime"] === "") {
        del = "";
      } else {
        del = " - ";
      }
      let name = marker.calEvent["eventName"];
      let shortDesc =  marker.calEvent["shortDescription"];
      if(shortDesc === undefined){
        shortDesc = "";
      }
      let price = marker.calEvent["otherCostInfo"] === undefined || marker.calEvent["otherCostInfo"] === null ? "" : marker.calEvent["otherCostInfo"];
      let webSite = marker.calEvent["eventWebsite"];
      let description = marker.calEvent["description"];
      let orgPhone = marker.calEvent["orgPhone"];
      let orgAddress = marker.calEvent["orgAddress"]; 
      let categories = marker.calEvent["categoryString"];
      let img = "http://mnlct.org/wp-content/uploads/2014/10/toronto-skyline.jpg";
      if( marker.calEvent["image"] !== undefined)
        img = "https://secure.toronto.ca" + marker.calEvent["image"]["url"];

      //variable to pass into setContent of infoWindow
      let contentString =              
                    '<div id="iw-container">' +
                    '<p><span id="eventId" hidden>' + id + '</span></p>' + 
                    '<p><span id="eventWebsite" hidden>' + webSite + '</span></p>' + 
                    '<p><span id="eventLat" hidden>' + lat + '</span></p>' + 
                    '<p><span id="eventLng" hidden>' + lng + '</span></p>' + 
                    '<div class="iw-title">' +
                    '<p class="title"><span id="eventName">' + name + '</span></p>' + 
                      '<p ><span id="eventStartDate">' + "Date: " + startDate + '</span>  <span id="eventEndDate">' + " - " + endDate + '</span></p>' + 
                      '<p><span id="eventStartTime">' + "Time: " + startTime + '</span>  <span id="eventEndTime">' + del + endTime + '</span></p>' +
                      '</div>' + 
                      '<div>' + 
                      '<input type="button" id="bookmarkImage" value="Bookmark"/>' +
                      '</div>' +
                      '<div class="iw-content">' +
                        shortDesc +
                      '</div>' +
                      '<img src= "' + img + '" height="230" width="238">' +
                      '<div class="iw-subTitle"> Event Details: </div>' +
                      '<p class="description"><span id="eventDescription">' + description + '</span></p>' +
                      '<div class="iw-subTitle">More information: </div>' + '<p class="content"><a href="'+ webSite +'">'  +  webSite     +       '</a></p>'    +              
                      '<div class="iw-subTitle">Event Location: </div> '   +
                      '<p class="content"><span id="eventAddress">'    + orgAddress    + '</span></p>'   +
                      '<div class="iw-subTitle">Contact Information: </div> '   +
                      '<p class="content"><span id="eventPhone">'    + orgPhone    + '</span></p>'   +                                          
                      '<div class="iw-subTitle">Category(s): </div> '  + 
                      '<p class="content"><span id="eventCat">' + categories  + '</span></p>' +
                      '<p class="content"><span id="eventPrice">' + price  + '</span></p>' +
                    '</div>'; 
        
      var mapmarker = new google.maps.Marker({
        position: loc,
        map: this.map
      });

      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 350,
        content: contentString
      }); 

      google.maps.event.addListener(mapmarker, 'click', function() {
        infoWindow.setContent(contentString);   
        infoWindow.open(this.map, mapmarker);
      });

      var self = this;

      google.maps.event.addListener(infoWindow, 'domready', function() {
        var bookmarkImage = document.getElementById('bookmarkImage');

        var id = document.getElementById('eventId').outerText;
        var lat = document.getElementById('eventLat').outerText;
        var lng = document.getElementById('eventLng').outerText;
        var startDate = document.getElementById('eventStartDate').outerText;
        var startTime = document.getElementById('eventStartTime').outerText;
        var endDate = document.getElementById('eventEndDate').outerText;
        var endTime = document.getElementById('eventEndTime').outerText;
        var name = document.getElementById('eventName').outerText;
        var price = document.getElementById('eventPrice').outerText;
        var webSite = document.getElementById('eventWebsite').outerText;
        var description = document.getElementById('eventDescription').outerText;
        var orgPhone = document.getElementById('eventPhone').outerText;
        var orgAddress = document.getElementById('eventAddress').outerText;
        var categories = document.getElementById('eventCat').outerText;
        
        bookmarkImage.addEventListener('click', () => {
          self.addEvent(lat, lng, startDate, startTime, endDate, endTime, name,
            price, webSite, description, orgPhone, orgAddress, categories, id);
            if (self.icon(id)){
              bookmarkImage.setAttribute('value','Unbookmark')
            } else {
              bookmarkImage.setAttribute('value','Bookmark')
            }
        });
        if (self.icon(id)){
          bookmarkImage.setAttribute('value','Unbookmark')
        } else {
          bookmarkImage.setAttribute('value','Bookmark')
        }
     });
    } 
  }

    addUserEventMarkersMap(e, id){
        let img = "http://mnlct.org/wp-content/uploads/2014/10/toronto-skyline.jpg";
        let contentString =              
                    '<div id="iw-container">' +
                    '<p><span id="eventId" hidden>' + id + '</span></p>' + 
                    '<p><span id="eventWebsite" hidden>' + e.website + '</span></p>' + 
                    '<p><span id="eventLat" hidden>' + e.latitude + '</span></p>' + 
                    '<p><span id="eventLng" hidden>' + e.longitude + '</span></p>' + 
                    '<div class="iw-title">' +
                    '<p class="title"><span id="eventName">' + e.name + '</span></p>' + 
                      '<p ><span id="eventStartDate">' + "Date: " + e.startDate + '</span>  <span id="eventEndDate">' + " - " + e.endDate + '</span></p>' + 
                      '<p><span id="eventStartTime">' + "Time: " + e.startTime + '</span>  <span id="eventEndTime">' + " - " + e.endTime + '</span></p>' +
                      '</div>' + 
                      '<div>' + 
                      '<input type="button" id="bookmarkImage" value="Bookmark"/>' +
                      '</div>' +
                      '<img src= "' + img + '" height="230" width="238">' +
                      '<div class="iw-subTitle"> Event Details: </div>' +
                      '<p class="description"><span id="eventDescription">' + e.description + '</span></p>' +
                      '<div class="iw-subTitle">More information: </div>' + '<p class="content"><a href="'+ e.website +'">'  +  e.website     +       '</a></p>'    +              
                      '<div class="iw-subTitle">Event Location: </div> '   +
                      '<p class="content"><span id="eventAddress">'    + e.address    + '</span></p>'   +
                      '<div class="iw-subTitle">Contact Information: </div> '   +
                      '<p class="content"><span id="eventPhone">'    + e.phone    + '</span></p>'   +                                          
                      '<div class="iw-subTitle">Category(s): </div> '  + 
                      '<p class="content"><span id="eventCat">' + e.categoryString  + '</span></p>' +
                      '<p class="content"><span id="eventPrice">' + "Price: $" + e.price + '</span></p>' +
                    '</div>'; 

        let loc = {lng: e.longitude, lat: e.latitude};
        var marker = new google.maps.Marker({
          position: loc,
          map: this.map,   
        });

        var infoWindow = new google.maps.InfoWindow({
          maxWidth: 350,
          content: contentString
        }); 

        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(this.map, marker);
          infoWindow.setContent(contentString);   
        });

      var self = this;

      google.maps.event.addListener(infoWindow, 'domready', function() {
        var bookmarkImage = document.getElementById('bookmarkImage');

        var id = document.getElementById('eventId').outerText;
        var lat = document.getElementById('eventLat').outerText;
        var lng = document.getElementById('eventLng').outerText;
        var startDate = document.getElementById('eventStartDate').outerText;
        var startTime = document.getElementById('eventStartTime').outerText;
        var endDate = document.getElementById('eventEndDate').outerText;
        var endTime = document.getElementById('eventEndTime').outerText;
        var name = document.getElementById('eventName').outerText;
        var price = document.getElementById('eventPrice').outerText;
        var webSite = document.getElementById('eventWebsite').outerText;
        var description = document.getElementById('eventDescription').outerText;
        var orgPhone = document.getElementById('eventPhone').outerText;
        var orgAddress = document.getElementById('eventAddress').outerText;
        var categories = document.getElementById('eventCat').outerText;
        
        bookmarkImage.addEventListener('click', () => {
          self.addEvent(lat, lng, startDate, startTime, endDate, endTime, name,
            price, webSite, description, orgPhone, orgAddress, categories, id);
            if (self.icon(id)){
              bookmarkImage.setAttribute('value','Unbookmark')
            } else {
              bookmarkImage.setAttribute('value','Bookmark')
            }
        });
        if (self.icon(id)){
          bookmarkImage.setAttribute('value','Unbookmark')
        } else {
          bookmarkImage.setAttribute('value','Bookmark')
        }
     });
    }
}