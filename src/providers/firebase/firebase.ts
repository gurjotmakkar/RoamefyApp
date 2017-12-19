import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class FirebaseProvider {
  userID: string;

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
    var interest;
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

}
