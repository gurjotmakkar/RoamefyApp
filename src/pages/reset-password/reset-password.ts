import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { LoginPage } from '../login/login'

@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  public resetPasswordForm:FormGroup;
  public submitAttempt;

  constructor(public authData: FirebaseProvider, public formBuilder: FormBuilder,
  public nav: NavController, public alertCtrl: AlertController, public menu: MenuController) {

  // build reset form
  this.resetPasswordForm = formBuilder.group({
    email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
  })
}

resetPassword(){
  this.submitAttempt = true;

  // check if reset form is valid
  if (!this.resetPasswordForm.valid){
    console.log(this.resetPasswordForm.value);
  } else {

    // send reset password email to the user
    this.authData.resetPassword(this.resetPasswordForm.value.email)
    .then((user) => {
      let alert = this.alertCtrl.create({
        message: "We just sent you a reset link to your email",
        buttons: [
          {
            text: "Ok",
            role: 'cancel',
            handler: () => {
              this.nav.setRoot(LoginPage);
            }
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
}

// redirect to login page
goHome(){
  this.nav.setRoot(LoginPage);
}

}