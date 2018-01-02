import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserEvent } from '../../models/events/userevent.model';

interface Interest{
  name: string;
}

interface Chat{
  message: string;
  time: string;
  userID: string;
  userName: string;
}

interface Event{
  name: string;
  host: string;
}

interface Collection{
  name: string;
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

  eventCollection: AngularFirestoreCollection<Event>; // host
  events: any;
  bookmarkEventCollection: AngularFirestoreCollection<Collection>; // member
  bookmarkEvents: any;
  chatCollection: AngularFirestoreCollection<Collection>; // member
  chats: any;
  interestCollection: AngularFirestoreCollection<Collection>; // member
  interests: any;
  roleCollection: AngularFirestoreCollection<Collection>; // normal and pro member
  rolses: any;
  userCollection: AngularFirestoreCollection<Collection>; // sub collections
  users: any;

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

  deleteAccount(){
    // ---------- events by user ---------------
    this.eventCollection = this.afdOf.collection<Event>('events', ref => {
      return ref.where('host', '==', this.userID);
    });
    this.events = this.eventCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.events.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('events').doc(a.id).delete();
      })
    });

    // ---------- bokmarked ---------------
    this.bookmarkEventCollection = this.afdOf.collection<Collection>('bookmarkedEvents');
    this.bookmarkEvents = this.bookmarkEventCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.bookmarkEvents.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('bookmarkedEvents').doc(a.id).collection('members').doc(this.userID).delete();
      })
    });

    // ---------- chats ---------------
    this.chatCollection = this.afdOf.collection<Collection>('chatrooms');
    this.chats = this.chatCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.chats.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('chatrooms').doc(a.id).collection('members').doc(this.userID).delete();
      })
    });

    // ---------- interests ---------------
    this.interestCollection = this.afdOf.collection<Collection>('interest');
    this.interests = this.interestCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.interests.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('interest').doc(a.id).collection('members').doc(this.userID).delete();
      })
    });

    // ---------- users bookmarks ---------------
    this.userCollection = this.afdOf.collection('users').doc(this.userID).collection<Collection>('bookmarkedEvents');
    this.users = this.userCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.users.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('users').doc(this.userID).collection('bookmarkedEvents').doc(a.id).delete();
      })
    });

    // ---------- users chats ---------------
    this.userCollection = this.afdOf.collection('users').doc(this.userID).collection<Collection>('chatrooms');
    this.users = this.userCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.users.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('users').doc(this.userID).collection('chatrooms').doc(a.id).delete();
      })
    });

    // ---------- users interests ---------------
    this.userCollection = this.afdOf.collection('users').doc(this.userID).collection<Collection>('userInterest');
    this.users = this.userCollection.snapshotChanges().map(actions => {
      return actions.map(snap => {
        let id = snap.payload.doc.id;
        let data = { id, ...snap.payload.doc.data()};
        return data;
      });
    });
    this.users.forEach(e => {
      e.forEach(a => {
        this.afdOf.collection('users').doc(this.userID).collection('userInterest').doc(a.id).delete();
      })
    });

    // ---------- roles ---------------
    this.afdOf.collection('roles').doc('normal').collection('members').doc(this.userID).delete();
    this.afdOf.collection('roles').doc('pro').collection('members').doc(this.userID).delete();


    // ---------- user ---------------
    this.afdOf.collection('users').doc(this.userID).delete();

    // ---------- user account ---------------
    this.afAuth.auth.currentUser.delete()
    .then(() => {
      console.log('Account deleted');
    }).catch(err => {
      console.log('Account deletion error: ' + err);
    });

  }

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
    var joinDate = new Date().toISOString();
    this.afdOf.collection("users").doc(user.uid)
    .set(
      { 
        firstName: newFirstName,
        lastName: newLastName,
        joinDate: joinDate,
        configured: false,
        //distance: 50,
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
    var joinDate = new Date().toISOString();
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
        //distance: 50,
        time: 10,
        role: 'pro'
      });

      this.afdOf.collection("roles/pro/members").doc(newId)
      .set({
        name: newId
      })
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

  editUserProfilePro(newEmail: string, newFirstName: string, newLastName: string, 
    address:string, dob: string, driverLicense: string, phone: number): Promise<any> {
    return this.afAuth.auth.currentUser.updateEmail(newEmail)
    .then(() => {
        this.afAuth.auth.currentUser.sendEmailVerification()
        .then(() => {
          console.log('verification email sent');
        });
        this.updateUserPro(this.afAuth.auth.currentUser.uid, newFirstName, newLastName, address, dob, driverLicense, phone);
        //this.logoutUser();
    });
  }

  updateUserPro(Id, FirstName, LastName, address, dob, driverLicense, phone) {
    this.afdOf.collection("users").doc(Id)
    .update({ 
        firstName: FirstName,
        lastName: LastName,
        address: address,
        dateOfBirth: dob,
        driverLicenceNumber: driverLicense,
        phoneNumber: phone 
      });
  }

  switchToPro(address, dob, driverLicense, phone) {
    this.afdOf.collection("users").doc(this.userID)
    .set({ 
        address: address,
        dateOfBirth: dob,
        driverLicenceNumber: driverLicense,
        phoneNumber: phone,
      },{
        merge: true
      })
      .then(() => {
        this.afdOf.collection("users").doc(this.userID)
        .update({ 
          role: 'pro'
        });
        this.afdOf.collection('roles').doc('normal').collection('members').doc(this.userID).delete();
        this.afdOf.collection('roles').doc('pro').collection('members').doc(this.userID)
        .set({
          name: this.userID
        });
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

  configureUser(){
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
  /*
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
*/

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

  addEvent(event: UserEvent) {
    this.afdOf.collection("events").add(event)
  }

  updateEvent(id, event: UserEvent) {
    console.log(event);
    this.afdOf.doc("events/" + id).update(event);
  }

  removeEvent(id) {
    this.afdOf.doc("events/" + id).delete();
    this.afdOf.collection("bookmarkedEvents").doc(id).delete();
    this.afdOf.collection("users").doc(this.userID).collection("bookmarkedEvents").doc(id).delete();
    this.afdOf.collection("chatrooms").doc(id).delete();
    this.afdOf.collection("users").doc(this.userID).collection("chatrooms").doc(id).delete();
}
  
//-------------- bookmark event ----------------

bookmarkEvent(lat, lng, startDate, startTime, endDate, endTime, name,
  price, webSite, description, orgPhone, orgAddress, categories, id) {
  this.afdOf.collection("bookmarkedEvents").doc(id).set({
    latitude: lat,
    longitude: lng,
    name: name,
    description: description,
    price: price,
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
    address: orgAddress, 
    website: webSite,
    phone: orgPhone,
    categories: categories
  }).then(a => {
    this.afdOf.collection("bookmarkedEvents").doc(id).collection("members").doc(this.userID).set({
      name: this.userID
    });
    this.afdOf.collection("users").doc(this.userID).collection("bookmarkedEvents").doc(id).set({
      latitude: lat,
      longitude: lng,
      name: name,
      description: description,
      price: price,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      address: orgAddress, 
      website: webSite,
      phone: orgPhone,
      categories: categories
    });
  });

  this.afdOf.collection("chatrooms").doc(id).set({
    name: name
  }).then(  a => {
    this.afdOf.collection("chatrooms").doc(id).collection("members").doc(this.userID).set({
      name: this.userID
    });
    this.afdOf.collection("users").doc(this.userID).collection("chatrooms").doc(id).set({
      name: name
    });
  });
}


bookmarkUserEvent(item, id) {
  console.log(item)
  this.afdOf.collection("bookmarkedEvents").doc(id).set({
    latitude: item.latitude,
    longitude: item.longitude,
    name: item.name,
    description: item.description,
    price: item.price,
    startDate: item.startDate,
    startTime: item.startTime,
    endDate: item.endDate,
    endTime: item.endTime,
    address: item.address, 
    website: item.website,
    phone: item.phone,
    categories: item.categoryString
  }).then(a => {
    this.afdOf.collection("bookmarkedEvents").doc(id).collection("members").doc(this.userID).set({
      name: this.userID
    });
    this.afdOf.collection("users").doc(this.userID).collection("bookmarkedEvents").doc(id).set({
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.name,
      description: item.description,
      price: item.price,
      startDate: item.startDate,
      startTime: item.startTime,
      endDate: item.endDate,
      endTime: item.endTime,
      address: item.address, 
      website: item.website,
      phone: item.phone,
      categories: item.categoryString
    });
  });

  this.afdOf.collection("chatrooms").doc(id).set({
    name: item.name
  }).then(  a => {
    this.afdOf.collection("chatrooms").doc(id).collection("members").doc(this.userID).set({
      name: this.userID
    });
    this.afdOf.collection("users").doc(this.userID).collection("chatrooms").doc(id).set({
      name: item.name
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
  this.chat.message = message;
  this.chat.userID = this.userID;
  this.chat.time = new Date().toISOString();
  this.chat.userName = this.getUserEmail().split('@')[0];

  this.afdOf.collection("chatrooms").doc(chatKey).collection("chats").add(this.chat);

}

//-------------- attractions ----------------

addAttraction(attractions){
  this.afdOf.collection("attractions").add(attractions);
}

updateAttraction(attractions, id){
  this.afdOf.doc("attractions/" + id).update(attractions);
}

deleteAttraction(id){
  this.afdOf.doc("attractions/" + id).delete();
}

}

