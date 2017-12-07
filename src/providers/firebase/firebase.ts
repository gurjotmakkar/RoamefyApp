import { Injectable } from '@angular/core';
import { UserEvent } from "../../models/events/userevent.model";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireOfflineDatabase } from 'angularfire2-offline/database';
import 'rxjs/add/operator/map';

@Injectable()
export class FirebaseProvider {
  userID: string;

  constructor(public afAuth: AngularFireAuth, public afdOf: AngularFireOfflineDatabase) {
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
    this.afdOf.reset;
    return this.afAuth.auth.signOut()
    .then(() => console.log("user logged out"))
    .catch(e => console.log("exception: " + e));
}
   
  //-------------- user signup ----------------
  signupUser(newEmail: string, newPassword: string, newFirstName: string, newLastName: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword)
    .then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification()
        .then(() => {
          console.log('verification email sent');
        });
        this.addNewUserProfile(this.afAuth.auth.currentUser.uid, newFirstName, newLastName);
        //this.logoutUser();
    });
  }
  
   addNewUserProfile(newId, newFirstName, newLastName) {
    var user = this.afAuth.auth.currentUser;
    this.afdOf.object("users/" + user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: new Date().getDate(),
        Configured: false
      });
    this.afdOf.object("Roles/Normal/" + user.uid).set(true);
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
    this.afdOf.object("users/" + user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: new Date().getDate(),
        Configured: false,
        dateOfBirth: newDOB,
        address: newAddress,
        driverLicenceNumber: newDLN,
        phoneNumber: newPhoneNumber
      });
    this.afdOf.object("Roles/Pro/" + user.uid).set(true);
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
    this.afdOf.object("users/" + Id)
    .update({ 
        firstName: FirstName,
        lastName: LastName
      });
  }


  //-------------- user info ----------------
  getObject(){
    return this.afdOf.object(`users/${this.userID}/`);
  }

  getUserId(){
    return this.userID;
  }

  getUserEmail() {
    return this.afAuth.auth.currentUser.email;
  }

  checkUserRole(){
    var checker = false;
    var db = this.afdOf.list("Roles/Pro/").subscribe( x => {
      x.forEach(i => {
        if (i.$key == this.userID)
          checker = true;
      });
    });
    db.unsubscribe();
    return checker;
  }

  configureUser(id){
    //this.afd.app.database().ref('users').child(this.userID).child('Configured').set(true);
    this.afdOf.object("/users/" + this.userID + "/Configured").set(true);
  }

  isUserConfigured(id){
    var configured;
    var db = this.afdOf.object("users/" + this.userID).subscribe( x => {
      configured = x.Configured;
    });
    db.unsubscribe();
    if(configured == false) {
      return true;
    }
    else{
      return false;
    }
  }

  //-------------- interest ----------------
  getInterestList() {
    //return this.afd.list('/Interests');
    return this.afdOf.list('/Interests');
  }

  addInterest(id, itemKey) {
    //const members = this.afd.app.database().ref(`Interests/${itemKey}/members`)
    //members.child(this.userID).set(true);
    this.afdOf.object("Interests/" + itemKey + "/members/" + this.userID).set(true);
  }

  removeInterest(id, itemKey) {
    //const member = this.afd.app.database().ref(`Interests/${itemKey}/members/${this.userID}`)
    //member.remove()
    this.afdOf.object("Interests/" + itemKey + "/members/" + this.userID).remove();
  }

  getInterestName(itemKey){
    var interest;
    var db = this.afdOf.object("Interests/" + itemKey).subscribe( x => {
      interest = x.name;
    });
    db.unsubscribe();
    return interest;
  }

  //-------------- distance and time ----------------
  updateDistance(id, value){
    //const distance = this.afd.app.database().ref(`users/${this.userID}/distance/`);
    //distance.set(value);
    this.afdOf.object("users/" + this.userID + "/distance/").set(value);
  }

  updateTime(id, value){
    //const time = this.afd.app.database().ref(`users/${this.userID}/time/`);
    //time.set(value);    
    this.afdOf.object("users/" + this.userID + "/time/").set(value);    
  }
  
  //-------------- event ----------------
  getUserEvents() {
    return this.afdOf.list('/Events/', {
      query: {
        orderByChild: 'host',
        equalTo: this.userID 
      }
    });
  }

  getSpecifiedEvent(eventID){
    return this.afdOf.object('/Events/' + eventID);
  }

  addEvent(event: UserEvent) {
    //var eventRef = this.afd.app.database().ref("Events");
    //eventRef.push(event);
    this.afdOf.list("Events").push(event);
  }

  updateEvent(id, event: UserEvent) {
    //var eventRef = this.afd.app.database().ref(`Events/${id}`);
    //console.log(id)
    //eventRef.set(event);
    this.afdOf.object("Events/" + id).set(event)
  }

  removeEvent(id) {
    //const eventRef = this.afd.app.database().ref(`Events/${id}`);
    //eventRef.remove();
    this.afdOf.object("Events/" + id).remove();
}

}