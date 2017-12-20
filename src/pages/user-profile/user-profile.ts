import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { UserProfileEditPage } from '../user-profile-edit/user-profile-edit';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  userEmail: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider, 
    public alertCtrl: AlertController) {
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

  logout() {
    this.navCtrl.setRoot(LoginPage);
    this.firebase.logoutUser();
}

  ngOnDestroy() {
}

}
