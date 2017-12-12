import { Injectable } from '@angular/core';
import { UserEvent } from "../../models/events/userevent.model";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
//import { AngularFireOfflineDatabase } from 'angularfire2-offline/database';
//import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';

interface roles{
  desription: string;
  members: string[];
}

@Injectable()
export class FirebaseProvider {
  userID: string;
  roles: roles;

  constructor(public afAuth: AngularFireAuth, 
    public afdOf: AngularFirestore) {
    const authObserver = afAuth.authState.subscribe( user => {
      if (user) {
        this.userID = user.uid;
        authObserver.unsubscribe();
      } else {
        this.userID = null;
        authObserver.unsubscribe();
      }
    });
  }
  
  //-------------- user login ----------------
  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword)
      .then(() => this.userID = this.afAuth.auth.currentUser.uid);
   }

   resetPassword(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
   }

   logoutUser() {
    //this.afdOf.reset();
    return this.afAuth.auth.signOut()
    .then(() => console.log("user logged out"))
    .catch(e => console.log("exception: " + e));
}
   
  //-------------- user signup ----------------
  signupUser(newEmail: string, newPassword: string, newFirstName: string, newLastName: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword)
    .then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification()
        .then(x => {
          console.log('firebase: ' + x);
          console.log('verification email sent');
        });
        this.addNewUserProfile(this.afAuth.auth.currentUser.uid, newFirstName, newLastName);
        //this.logoutUser();
    });
  }
  
   addNewUserProfile(newId, newFirstName, newLastName) {
    var user = this.afAuth.auth.currentUser;
    var date = new Date().getDate();
    var month = new Date().getMonth();
    var year = new Date().getFullYear();
    var joinDate = date + "/" + month + "/" + year;
    this.afdOf.collection("users").doc(user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: new Date(joinDate),
        configured: false,
        distance: 50,
        time: 10
      });

    this.afdOf.collection("roles/normal/members").add(newId);
  }

   signupProUser(newEmail: string, newPassword: string, newFirstName: string, newLastName: string, 
    newAddress: string, newDOB: string, newDLN: string, newPhoneNumber: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword)
    .then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification()
        .then(() => {
          console.log('verification email sent');
        });
        this.addProUserProfile(this.afAuth.auth.currentUser.uid, newFirstName, newLastName, 
          newAddress, newDOB, newDLN, newPhoneNumber);
        //this.logoutUser();
    });
  }
  
   addProUserProfile(newId, newFirstName, newLastName, newAddress, newDOB, newDLN, newPhoneNumber) {
    var user = this.afAuth.auth.currentUser;
    var date = new Date().getDate();
    var month = new Date().getMonth();
    var year = new Date().getFullYear();
    var joinDate = date + "/" + month + "/" + year;
    this.afdOf.collection("users").doc(user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: new Date(joinDate),
        configured: false,
        dateOfBirth: new Date(newDOB),
        address: newAddress,
        driverLicenceNumber: newDLN,
        phoneNumber: newPhoneNumber,
        distance: 50,
        time: 10
      });

      this.afdOf.collection("roles/pro/members").add(newId);
  }

  editUserProfile(newEmail: string, newFirstName: string, newLastName: string): Promise<any> {
    return this.afAuth.auth.currentUser.updateEmail(newEmail)
    .then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification()
        .then(() => {
          console.log('verification email sent');
        });
        this.updateUser(this.afAuth.auth.currentUser.uid, newFirstName, newLastName);
        //this.logoutUser();
    });
  }

  updateUser(Id, FirstName, LastName) {
    this.afdOf.collection("users").doc(Id)
    .update({ 
        firstName: FirstName,
        lastName: LastName
      });
  }


  //-------------- user info ----------------
  getObject(){
    var userObj;
    var docRef = this.afdOf.collection("users").doc(this.userID).ref;
    docRef.get().then(doc => {
      if (doc.exists) {
        userObj = doc.data();
      } else {
        console.log('Document does not exists')
      }
    }).catch( err => {
      console.log('Error in getting data: ' + err)
    });

    return userObj;
  
  }

  getUserId(){
    return this.userID;
  }

  getUserEmail() {
    return this.afAuth.auth.currentUser.email;
  }

  checkUserRole(){
    var checker = false;
    var docRef = this.afdOf.doc("roles/pro/members/" + this.userID).ref;
    docRef.get().then(doc => {
      if (doc.exists) {
        checker = true;
      } else {
        console.log('Document does not exists')
      }
    }).catch( err => {
      console.log('Error in getting data: ' + err)
    });

    console.log(checker);
  
    return checker;

  }

  configureUser(id){
    this.afdOf.collection("users").doc(this.userID)
    .update(
      { 
        configured: true
      });
    //this.afd.app.database().ref('users').child(this.userID).child('Configured').set(true);
    //this.afdOf.object("/users/" + this.userID + "/configured").set(true);
  }

  isUserConfigured(){
    var configured;
    var docRef = this.afdOf.collection("users").doc(this.userID).ref;
    docRef.get().then(doc => {
      if (doc.exists) {
        configured = doc.data().configured;
      } else {
        console.log('Document does not exists')
      }
    }).catch( err => {
      console.log('Error in getting data: ' + err)
    });

    return configured;
  
  }

  //-------------- interest ----------------
  getInterestList() {
    //return this.afd.list('/Interests');
    //this.afdOf.list('/Interests');

    this.afdOf.collection("interest").get().then( doc => {
 
    })

    return null;
  }

  addInterest(itemKey) {
    //const members = this.afd.app.database().ref(`Interests/${itemKey}/members`)
    //members.child(this.userID).set(true);
    //this.afdOf.object("/Interests/" + itemKey + "/members/" + this.userID).set(true);

      this.afdOf.collection("interest/" + itemKey + "/members").add(this.userID);
  }

  removeInterest(itemKey) {
    //const member = this.afd.app.database().ref(`Interests/${itemKey}/members/${this.userID}`)
    //member.remove()
    //this.afdOf.object("/Interests/" + itemKey + "/members/" + this.userID).remove();

    this.afdOf.doc("interest/" + itemKey + "/members/" + this.userID).delete();
  }

  getInterestName(itemKey){
    var interest;
    /*
    var db = this.afdOf.object("/Interests/" + itemKey).subscribe( x => {
      interest = x.name;
    });
    db.unsubscribe();
    */

    this.afdOf.doc("interest/" + itemKey).ref
    .get().then(doc => {
      if ( doc.exists)
        interest = doc.data().name;
      else
        console.log('interest does not exist to get name');
    })

    return interest;
  }

  //-------------- distance and time ----------------
  updateDistance(value){
    //const distance = this.afd.app.database().ref(`users/${this.userID}/distance/`);
    //distance.set(value);
    //this.afdOf.object("/users/" + this.userID + "/distance/").set(value);
    this.afdOf.doc("users/" + this.userID)
    .update({
      distance: value
    });
  }

  updateTime(value){
    //const time = this.afd.app.database().ref(`users/${this.userID}/time/`);
    //time.set(value);    
    //this.afdOf.object("/users/" + this.userID + "/time/").set(value);  
    this.afdOf.doc("users/" + this.userID)
    .update({
      time: value
    });  
  }
  
  //-------------- event ----------------
  getUserEvents() {
    /*
    return this.afdOf.list('/events/', {
      query: {
        orderByChild: 'host',
        equalTo: this.userID 
      }
    });
    */
    return this.afdOf.collection("events").snapshotChanges();
  }

  getSpecifiedEvent(eventID){
    return this.afdOf.doc("events/" + eventID).snapshotChanges();
    //this.afdOf.object('/events/' + eventID);
  }

  addEvent(event: UserEvent) {
    //var eventRef = this.afd.app.database().ref("Events");
    //eventRef.push(event);
    //this.afdOf.list("/events/").push(event);
    this.afdOf.collection("events").add(event)
  }

  updateEvent(id, event: UserEvent) {
    //var eventRef = this.afd.app.database().ref(`Events/${id}`);
    //console.log(id)
    //eventRef.set(event);
    //this.afdOf.object("/events/" + id).set(event)
    this.afdOf.doc("events/" + id).update(event);
  }

  removeEvent(id) {
    //const eventRef = this.afd.app.database().ref(`Events/${id}`);
    //eventRef.remove();
    //this.afdOf.object("/events/" + id).remove();
    this.afdOf.doc("events/" + id).delete();
}

}