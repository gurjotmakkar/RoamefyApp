import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { SettingsPage } from '../settings/settings'
import { UserProfilePage } from '../user-profile/user-profile'

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  home = HomePage;
  setting = SettingsPage;
  user = UserProfilePage;

  constructor() {}

}
