import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { UserProfileEditPage } from '../user-profile-edit/user-profile-edit';
import { LoginPage } from '../login/login';
import { SettingsPage } from '../settings/settings';
import { ViewController } from 'ionic-angular/navigation/view-controller';

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  userEmail: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider, 
    public alertCtrl: AlertController, public viewCtrl: ViewController) {
      this.userEmail = this.firebase.getUserEmail();
  }

  edit(){
    this.navCtrl.setRoot(UserProfileEditPage);
  }

  goToResetPassword(){
    this.firebase.resetPassword(this.userEmail)
    .then((user) => {
      let alert = this.alertCtrl.create({
        message: "We just sent you a reset link to your email",
        buttons: [
          {
            text: "Ok",
            role: 'cancel'
          }
        ]
      });
      alert.present();
    }, (error) => {
      var errorMessage: string = error.message;
      let errorAlert = this.alertCtrl.create({
        message: errorMessage,
        buttons: [
          {
            text: "Ok",
            role: 'cancel'
          }
        ]
      });
      errorAlert.present();
    });
  }

goHome(){
  this.navCtrl.setRoot(SettingsPage);
}

deleteAccount(){
  let alert = this.alertCtrl.create({
    title: 'Confirm deleting account',
    message: 'Do you want delete this account?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
          this.firebase.logoutUser();
        }
      },
      {
        text: 'Yes',
        handler: () => {
          console.log('Yes clicked');
          this.navCtrl.setRoot(LoginPage);
          this.firebase.deleteAccount();
          this.firebase.logoutUser();
        }
      }
    ]
  });
  alert.present();
}

  ngOnDestroy() {
    this.viewCtrl.dismiss();
  }

}
