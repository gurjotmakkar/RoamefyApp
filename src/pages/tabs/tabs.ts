import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { SettingsPage } from '../settings/settings'
import { UserProfilePage } from '../user-profile/user-profile'
import { FirebaseProvider } from '../../providers/firebase/firebase'

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  home = HomePage;
  setting = SettingsPage;
  user = UserProfilePage;
  role: string;

  constructor(private firebase: FirebaseProvider) {
    this.role = this.firebase.getUserId();
  }
  
  isUserLogged(){
    return this.role === undefined ? false : true;
  }

}
