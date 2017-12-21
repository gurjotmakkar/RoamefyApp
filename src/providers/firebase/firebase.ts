import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';

interface Interest{
  name: string;
}

interface Chat{
  message: string;
  time: string;
  userID: string;
  userName: string;
}

@Injectable()

export class FirebaseProvider {
  userID: string;
  chat: Chat = {
    message: '',
    time: '',
    userID: '',
    userName: ''
  };

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
    var date = new Date().getUTCDate();
    var month = new Date().getUTCMonth();
    var year = new Date().getUTCFullYear();
    var joinDate = date + "/" + month + "/" + year;
    this.afdOf.collection("users").doc(user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: new Date(joinDate),
        configured: false,
        distance: 50,
        time: 10,
        role: 'normal'
      });

    this.afdOf.collection("roles/normal/members").doc(newId)
    .set({
      name: newId
    });
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
    var date = new Date().getUTCDate();
    var month = new Date().getUTCMonth();
    var year = new Date().getUTCFullYear();
    var joinDate = date + "/" + month + "/" + year;
    this.afdOf.collection("users").doc(user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: joinDate,
        configured: false,
        dateOfBirth: newDOB,
        address: newAddress,
        driverLicenceNumber: newDLN,
        phoneNumber: newPhoneNumber,
        distance: 50,
        time: 10,
        role: 'pro'
      });

      this.afdOf.collection("roles/pro/members").doc(newId)
      .set({
        name: newId
      })
  }

  editUserProfile(newEmail: string, newFirstName: string, newLastName: string, 
    address:string, dob: string, driverLicense: string, phone: number): Promise<any> {
    return this.afAuth.auth.currentUser.updateEmail(newEmail)
    .then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification()
        .then(() => {
          console.log('verification email sent');
        });
        this.updateUser(this.afAuth.auth.currentUser.uid, newFirstName, newLastName, address, dob, driverLicense, phone);
        //this.logoutUser();
    });
  }

  updateUser(Id, FirstName, LastName, address = null, dob = null, driverLicense = null, phone = null) {
    this.afdOf.collection("users").doc(Id)
    .update({ 
        firstName: FirstName,
        lastName: LastName,
        address: addEventListener,
        dateOfBirth: dob == null ? dob : new Date(dob),
        driverLicenceNumber: driverLicense,
        phoneNumber: phone 
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
    console.log(this.userID);
    return this.afdOf.collection('users').doc(this.userID).valueChanges();
  }

  configureUser(id){
    this.afdOf.collection("users").doc(this.userID)
    .update(
      { 
        configured: true
      });
  }

  isUserConfigured(){
    return this.afdOf.collection('users').doc(this.userID).valueChanges();
  }

  //-------------- interest ----------------
  getInterestList() {
    return "interest";
  }

  addInterest(itemKey) {
    this.afdOf.collection("interest").doc(itemKey).set({
      members: [this.userID]
    }, {
      merge: true
    });
  }

  removeInterest(itemKey) {
    this.afdOf.collection("interest").doc(itemKey).set({
      members: [this.userID]
    }, {
      merge: true
    });
  }

  getInterestName(itemKey){
    var interest = "";
    this.afdOf.collection('interest').doc<Interest>(itemKey).valueChanges()
    .subscribe(a => {
      interest = a.name;
    });
    return interest;
  }

  //-------------- distance and time ----------------
  updateDistance(value){
    this.afdOf.doc("users/" + this.userID)
    .update({
      distance: value
    });
  }

  updateTime(value){
    this.afdOf.doc("users/" + this.userID)
    .update({
      time: value
    });  
  }
  
  //-------------- event ----------------
  getUserEvents() {
    return this.afdOf.collection("events").snapshotChanges();
  }

  getSpecifiedEvent(eventID){
    return this.afdOf.doc("events/" + eventID).snapshotChanges();
  }

  addEvent(event) {
    this.afdOf.collection("events").add(event)
  }

  updateEvent(id, event) {
    this.afdOf.doc("events/" + id).update(event);
  }

  removeEvent(id) {
    this.afdOf.doc("events/" + id).delete();
}
  
//-------------- bookmark event ----------------

bookmarkEvent(event, id) {
  this.afdOf.collection("bookmarkedEvents").doc(event.recId).set({
    name: event.eventName,
    lat: event.locations[0].coords.lat,
    lng: event.locations[0].coords.lng
  }).then(a => {
    this.afdOf.collection("bookmarkedEvents").doc(event.recId).collection("members").doc(this.userID).set({
      name: this.userID
    });
    this.afdOf.collection("users").doc(this.userID).collection("bookmarkedEvents").doc(event.recId).set({
      name: event.eventName
    });
  });

  this.afdOf.collection("chatrooms").doc(event.recId).set({
    name: event.eventName
  }).then(  a => {
    this.afdOf.collection("chatrooms").doc(event.recId).collection("members").doc(this.userID).set({
      name: this.userID
    });
    this.afdOf.collection("users").doc(this.userID).collection("chatrooms").doc(event.recId).set({
      name: event.eventName
    });
  });
}

unbookmarkEvent(id) {
  this.afdOf.collection("bookmarkedEvents").doc(id).collection("members").doc(this.userID).delete();
  this.afdOf.collection("users").doc(this.userID).collection("bookmarkedEvents").doc(id).delete();
  this.afdOf.collection("chatrooms").doc(id).collection("members").doc(this.userID).delete();
  this.afdOf.collection("users").doc(this.userID).collection("chatrooms").doc(id).delete();
}

//-------------- chats ----------------

pushMessage(chatKey, message){
  var date = new Date().getUTCDate();
  var month = new Date().getUTCMonth();
  var year = new Date().getUTCFullYear();
  var joinDate = date + "/" + month + "/" + year;

  this.chat.message = message;
  this.chat.userID = this.userID;
  this.chat.time = joinDate;
  this.chat.userName = this.getUserEmail().split('@')[0];

  this.afdOf.collection("chatrooms").doc(chatKey).collection("chats").add(this.chat);

}

}
