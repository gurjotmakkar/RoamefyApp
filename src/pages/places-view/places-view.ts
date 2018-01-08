import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Attractions } from '../../models/attractions/attractions.model';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EditAttractionPage } from '../edit-attraction/edit-attraction';

interface Access{
  name: string;
}

@IonicPage()
@Component({
  selector: 'page-places-view',
  templateUrl: 'places-view.html',
})

export class PlacesViewPage {

  attractionCollection: AngularFirestoreCollection<Attractions>;
  attractions: any;
  access: string;
  userID: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private afs: AngularFirestore, private firebase: FirebaseProvider) {

      // get user id
      this.userID = this.firebase.getUserId();

      // get list of all attractions
      this.attractionCollection = this.afs.collection<Attractions>("attractions");
      this.attractions = this.attractionCollection.snapshotChanges().map(actions => {
        return actions.map(snap => {
          let id = snap.payload.doc.id;
          let data = { id, ...snap.payload.doc.data() };
          return data;
        });
      });

      // check if current user have superior level access
      this.afs.collection('superiorLevelAccess').doc<Access>(this.userID).snapshotChanges()
      .forEach(a => {
        if (a.payload.exists){
          this.access = this.userID;
        }
      })
  }

  // page load
  ionViewDidLoad() {
    console.log('ionViewDidLoad PlacesViewPage');
  }

  // redirect to attraction edit page
  editAttraction(key){
    this.navCtrl.setRoot(EditAttractionPage, {id: key})
  }

  // check if current user have superior level access
  checkIfDev(){
    if( this.access == this.userID)
      return true;
    return false;
  }

}
