import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

// page reference
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { EventListPage } from '../pages/event-list/event-list';
import { EventMapPage } from '../pages/event-map/event-map';
import { InterestPage } from '../pages/interest/interest';
import { LoginPage } from '../pages/login/login';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { SettingsPage } from '../pages/settings/settings';
import { SignupPage } from '../pages/signup/signup';
import { SignupProPage } from '../pages/signup-pro/signup-pro';
import { TimeDistancePage } from '../pages/time-distance/time-distance';
import { UserEventAddPage } from '../pages/user-event-add/user-event-add';
import { UserEventEditPage } from '../pages/user-event-edit/user-event-edit';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { UserCreatedEventPage } from '../pages/user-created-event/user-created-event';
import { UserProfileEditPage } from '../pages/user-profile-edit/user-profile-edit';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpProvider } from '../providers/http/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { FirebaseProvider } from './../providers/firebase/firebase';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireOfflineModule } from 'angularfire2-offline';

//Firebase database configuration data
//DO NOT CHANGE ANYTHING
const firebaseConfig = {
  apiKey: "AIzaSyAfAtP5YK9MsFgB7erifiiLX3XT4JouuY0",
  authDomain: "roamefy-app.firebaseapp.com",
  databaseURL: "https://roamefy-app.firebaseio.com",
  projectId: "roamefy-app",
  storageBucket: "roamefy-app.appspot.com",
  messagingSenderId: "844616883402"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    EventListPage,
    EventMapPage,
    InterestPage,
    LoginPage,
    SettingsPage,
    SignupProPage,
    TimeDistancePage,
    UserEventAddPage,
    UserEventEditPage,
    UserProfilePage,
    UserProfileEditPage,
    UserCreatedEventPage
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireOfflineModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    EventListPage,
    EventMapPage,
    InterestPage,
    LoginPage,
    SettingsPage,
    SignupProPage,
    TimeDistancePage,
    UserEventAddPage,
    UserEventEditPage,
    UserProfilePage,
    UserProfileEditPage,
    UserCreatedEventPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FirebaseProvider,
    HttpClientModule,
    HttpProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
