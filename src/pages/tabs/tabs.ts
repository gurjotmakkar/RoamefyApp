import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SettingsPage } from '../settings/settings'
import { UserProfilePage } from '../user-profile/user-profile'

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  home = HomePage;
  setting = SettingsPage;
  user = UserProfilePage;

  constructor() {}
}
