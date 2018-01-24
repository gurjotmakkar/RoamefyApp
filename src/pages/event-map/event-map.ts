import { Component , ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserEvent } from '../../models/events/userevent.model';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

declare var google: any;
//declare var $: any;
/*
interface Interest {
  name: string;
}
*/

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
  api: string;
  map: any;
  userEventCollection: AngularFirestoreCollection<Member>;
  userEvents: any;
  userID: string;
  eventArr: string[] = [];
  //interestArr: string[] = [];
  //interestId: string[] = [];
  
  constructor(public navCtrl: NavController, public http: HttpClient, 
    public loading: LoadingController, private afs: AngularFirestore,
    private firebase: FirebaseProvider, private alertCtrl: AlertController) {

    // get toronto event api
    this.api = this.firebase.getTorontoEvents();
    // get user id
    this.userID = this.firebase.getUserId();
    
    
    // get events list bookmarked by user
    this.userEventCollection = this.afs.collection('users').doc(this.userID).collection<Member>('bookmarkedEvents');
    this.userEvents = this.userEventCollection.snapshotChanges().forEach(a => {
      this.eventArr = [];
      for ( var i in a )
        this.eventArr.push(a[i].payload.doc.id);
    });

    /*
    // get interest name and id into arrays
    this.afs.collection<Interest>('interest').snapshotChanges()
      .forEach(i => {
        i.forEach(a => {
          this.interestId.push(a.payload.doc.id);
          this.interestArr.push(a.payload.doc.data().name);
        })
      })
    */
    }

  // load events on map when the page is loaded
  ionViewDidLoad(){
    this.setDefaultMap();

    let loader = this.loading.create({
      content: "loading...."
    });  
    loader.present();
    this.http.get(this.api)
    .subscribe(data => {
      this.addMarkersMap(data);
    }, err => {
      console.log(err);
      loader.dismiss();
      const alert = this.alertCtrl.create({
        title: 'No network connection',
        message: 'Please connect to a cellular or wifi connection',
        buttons: [{
            text: 'Ok',
            role: 'cancel',
            handler: () => {
                console.log('did not able to get the events');
            }
        }]
      });
      alert.present();
    }, () => {
      loader.dismiss();
    }); 

    // get events created by user
    this.afs.collection<UserEvent>("events").snapshotChanges()
    .forEach(event => {
      event.forEach(e => {
        this.addUserEventMarkersMap(e.payload.doc.data(), e.payload.doc.id);
      })
    })
    
  }

  // display map showing current position of user
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

  // display map with fixed position
  setDefaultMap(){
    let latLng = new google.maps.LatLng(43.653908,-79.384293);
    let options = {
      center:latLng,
      zoom:12,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, options);
  }

  // check if user has bookmarked an event
  icon(id){
    var checker = false;
    this.eventArr.forEach(i => {
      if ( i == id )
        checker = true;
    })
    return checker
  }

  // bookmark / unbookmark event
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


  // add markers to the map
  addMarkersMap(markers){
    console.log(markers.length);
    
    for(let marker of markers) { 
      let del = "";
      let id = marker.calEvent["recId"];
      let loc = marker.calEvent.locations[0]["coords"] === undefined ? (marker.calEvent.locations[0]["coords"][0] === undefined ? "" : marker.calEvent.locations[0]["coords"][0]) : marker.calEvent.locations[0]["coords"];
      let lat = marker.calEvent.locations[0]["coords"].lat === undefined ? (marker.calEvent.locations[0]["coords"][0].lat === undefined ? "" : marker.calEvent.locations[0]["coords"][0].lat) : marker.calEvent.locations[0]["coords"].lat;
      let lng = marker.calEvent.locations[0]["coords"].lng === undefined ? (marker.calEvent.locations[0]["coords"][0].lng === undefined ? "" : marker.calEvent.locations[0]["coords"][0].lng) : marker.calEvent.locations[0]["coords"].lng;
      let startDate = marker.calEvent["startDate"].substr(0,10);
      let startTimeInfo = marker.calEvent["startDateTime"] === undefined || marker.calEvent["startDateTime"] === null ? "Time is not available" : marker.calEvent["startDateTime"].substr(11,5);
      let startTime = marker.calEvent["startDateTime"] === undefined || marker.calEvent["startDateTime"] === null ? marker.calEvent["startDate"].substr(11,5) : marker.calEvent["startDateTime"].substr(11,5);
      if(marker.calEvent["startDateTime"] === undefined || marker.calEvent["startDateTime"] === null){
        marker.calEvent["endDateTime"] = "";
        del = "";
      }
      let endDate = marker.calEvent["endDate"].substr(0,10);
      let endTimeInfo = marker.calEvent["endDateTime"]  === undefined || marker.calEvent["endDateTime"] === null ? "" : marker.calEvent["endDateTime"].substr(11,5);
      let endTime = marker.calEvent["endDateTime"]  === undefined || marker.calEvent["endDateTime"] === null ? marker.calEvent["endDate"].substr(11,5) : marker.calEvent["endDateTime"].substr(11,5);
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
                    '<p><span id="eventStartTime" hidden>' + startTime + '</span></p>' + 
                    '<p><span id="eventEndTime" hidden>' + endTime + '</span></p>' + 
                    '<div class="iw-title">' +
                    '<p class="title"><span id="eventName">' + name + '</span></p>' + 
                      '<p >' + "Date: " + '<span id="eventStartDate">' + startDate + '</span> - <span id="eventEndDate">' + endDate + '</span></p>' + 
                      '<p>' + "Time: " + startTimeInfo + del + endTimeInfo + '</p>' +
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
        
      // adding markers              
      var mapmarker = new google.maps.Marker({
        position: loc,
        map: this.map
      });

      var start = new Date(startDate + 'T' + "09:00");

      var startYear = new Date(start).getFullYear();
      var startMonth = new Date(start).getMonth();
      var startDay = new Date(start).getDate();
      var nowYear = new Date().getFullYear();
      var nowMonth = new Date().getMonth();
      var nowDate = new Date().getDate();


      if(startYear >= nowYear && startMonth >= nowMonth && startDay >= nowDate)
        mapmarker.setVisible(true);
      else
        mapmarker.setVisible(false);

      /*
      if(filterKey == 'interest'){
        if(categories.contains)
        mapmarker.setVisible(false);
      }
      */

      // generating info window and setting content
      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 350,
        content: contentString
      }); 

      // adding listener for click on marker
      google.maps.event.addListener(mapmarker, 'click', function() {
        infoWindow.setContent(contentString);   
        infoWindow.open(this.map, mapmarker);
      });

      var self = this;

      // adding listener for click inside infowindow
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
        
        // adding listener for click on infowindow bookmark button
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
    
  // add user events to map
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
                      '<p >'+"Date: " +'<span id="eventStartDate">' + e.startDate + '</span> - <span id="eventEndDate">' + e.endDate + '</span></p>' + 
                      '<p>' + "Time: " + '<span id="eventStartTime">' + e.startTime + '</span> - <span id="eventEndTime">' + e.endTime + '</span></p>' +
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
                      '<p class="content">' + "Price: $" + '<span id="eventPrice">' + e.price + '</span></p>' +
                    '</div>'; 

        // generating location object
        let loc = {lng: e.longitude, lat: e.latitude};

        // adding marker
        var marker = new google.maps.Marker({
          position: loc,
          map: this.map,   
        });
        
        var start = new Date(e.startDate + 'T' + "09:00");

        var startYear = new Date(start).getFullYear();
        var startMonth = new Date(start).getMonth();
        var startDay = new Date(start).getDate();
        var nowYear = new Date().getFullYear();
        var nowMonth = new Date().getMonth();
        var nowDate = new Date().getDate();
  
  
        if(startYear >= nowYear && startMonth >= nowMonth && startDay >= nowDate)
          marker.setVisible(true);
        else
          marker.setVisible(false);

        // generating info window
        var infoWindow = new google.maps.InfoWindow({
          maxWidth: 350,
          content: contentString
        }); 

        // add listener for click on marker
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(this.map, marker);
          infoWindow.setContent(contentString);   
        });

      var self = this;

      // add listener to click inside info window
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
        
        // add listener for click on bookmark button
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