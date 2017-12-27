import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { FirebaseProvider } from '../providers/firebase/firebase';
import { HttpProvider } from '../providers/http/http'
import { AngularFireAuth } from 'angularfire2/auth';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { AngularFirestore } from 'angularfire2/firestore';
import { InterestPage } from '../pages/interest/interest';
import { TimeDistancePage } from '../pages/time-distance/time-distance';
import { UserProfilePage } from '../pages/user-profile/user-profile';

interface User{
  configured: boolean;
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  config: boolean = false;
  counter: number = 0;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
    public afAuth: AngularFireAuth, public firebase: FirebaseProvider, public http: HttpProvider, 
    private afs: AngularFirestore) {
      const authObserver = this.afAuth.authState.subscribe( user => {
        if (user) {
          this.afs.collection('users').doc<User>(user.uid).valueChanges()
          .subscribe(a => {
            this.config = a.configured;
            this.afs.collection('users').doc(user.uid).collection("userInterest").valueChanges()
            .subscribe(a => {
              a.forEach(() => { this.counter++ });
            if (this.config) {
              console.log('set home')
              this.rootPage = HomePage;
            } else if (this.counter == 0) {
              console.log('set interest')
              this.rootPage = InterestPage;
            } else {
              console.log('set time&distance')
              this.rootPage = TimeDistancePage;
            }
            authObserver.unsubscribe();
            })
          })
        } else {
          this.rootPage = LoginPage;
          authObserver.unsubscribe();
        }
      });
      
      this.initializeApp();
  }
  
  initializeApp() {
    console.log('initializing app');
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
}
  
}
