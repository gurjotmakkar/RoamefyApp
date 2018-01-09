import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from './../../providers/firebase/firebase';
import { UserProfileEditPage } from '../user-profile-edit/user-profile-edit';
import { LoginPage } from '../login/login';
import { SettingsPage } from '../settings/settings';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserProfileEditProPage } from '../user-profile-edit-pro/user-profile-edit-pro';

interface User{
  role: string;
}

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {
  userEmail: string;
  userID: string;
  role: string = 'normal';

  constructor(public navCtrl: NavController, public navParams: NavParams, private firebase: FirebaseProvider, 
    public alertCtrl: AlertController, public viewCtrl: ViewController, private afs: AngularFirestore) {
      this.userEmail = this.firebase.getUserEmail();
      this.userID = this.firebase.getUserId();

      this.afs.collection('users').doc<User>(this.userID).valueChanges().take(1)
      .subscribe(a => {
        this.role = a.role == null ? 'normal' : a.role;
      })
  }

  edit(){
    if (this.role == 'pro' ) {
      this.navCtrl.setRoot(UserProfileEditProPage);
    } else {
      this.navCtrl.setRoot(UserProfileEditPage);
    }
  }

  isUserPro(){
    if (this.role == "pro")
      return true;
    return false;
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
            this.firebase.deleteEmail();
            this.firebase.logoutUser();
          }
        }
      ]
    });
    alert.present();
  }

  switchToPro(){
    this.navCtrl.setRoot(UserProfileEditProPage, {switch: true});
  }

  ngOnDestroy() {
    //this.viewCtrl.dismiss();
  }

}
