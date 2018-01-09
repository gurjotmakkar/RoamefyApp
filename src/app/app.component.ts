import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { FirebaseProvider } from '../providers/firebase/firebase';
import { AngularFireAuth } from 'angularfire2/auth';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { AngularFirestore } from 'angularfire2/firestore';
import { InterestPage } from '../pages/interest/interest';
import { TimeDistancePage } from '../pages/time-distance/time-distance';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

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
  exitApp: boolean = false;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen,
    public afAuth: AngularFireAuth, public firebase: FirebaseProvider, 
    private afs: AngularFirestore, public alertCtrl: AlertController) {
      //this.rootPage = LoginPage;
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

      var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
      };
  
      window["plugins"].OneSignal
        .startInit("e979d775-d7e2-46e7-88c9-864d62ac51b2", "844616883402")
        .handleNotificationOpened(notificationOpenedCallback)
        .endInit();

      this.platform.registerBackButtonAction(() => {  
                const alert = this.alertCtrl.create({
                    title: 'Exit app?',
                    message: 'Do you want to close the app?',
                    buttons: [{
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            console.log('Application exit prevented!');
                        }
                    },{
                        text: 'Close App',
                        handler: () => {
                            this.platform.exitApp(); // Close this application
                        }
                    }]
                });
                alert.present();
            });
        });
      }
}
