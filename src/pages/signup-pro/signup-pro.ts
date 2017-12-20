import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { PasswordValidator } from '../../validators/password';
import { LoginPage } from '../login/login'

@IonicPage()
@Component({
  selector: 'page-signup-pro',
  templateUrl: 'signup-pro.html',
})
export class SignupProPage {
  public signupForm:FormGroup;
  public loading:Loading;
  public submitAttempt;

  constructor(public nav: NavController, public authData: FirebaseProvider, public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, public menu: MenuController) {
    this.menu.swipeEnable(false);
    this.signupForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.required, PasswordValidator.isValid])],
      address: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(40)])],
      dateOfBirth: ['', Validators.compose([Validators.required, Validators.pattern("[0-9]{2}/[0-9]{2}/[1-2][0][0-9]{2}")])],
      driverLicenceNumber: ['', Validators.compose([Validators.required, Validators.pattern("[0-9a-zA-Z]{15}")])],
      phoneNumber: ['', Validators.compose([Validators.required, Validators.pattern("[0-9]{10}"), Validators.maxLength(10)])]
    });
  }

  signupUser(){
    this.submitAttempt = true;
    if (!this.signupForm.valid){
      console.log(this.signupForm.value);
    } else {
      this.authData.signupProUser(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.firstName, 
        this.signupForm.value.lastName, this.signupForm.value.address, this.signupForm.value.dateOfBirth, 
        this.signupForm.value.driverLicenceNumber, this.signupForm.value.phoneNumber)
      .then(() => {
        let alert = this.alertCtrl.create({
          message: "An email has been sent to you to verify your email address",
          buttons: [
            {
              text: "Ok",
              role: 'cancel'
            }
          ]
        });
        alert.present();
        this.nav.setRoot(LoginPage);
      }, (error) => {
        this.loading.dismiss().then( () => {
          var errorMessage: string = error.message;
            let alert = this.alertCtrl.create({
              message: errorMessage,
              buttons: [
                {
                  text: "Ok",
                  role: 'cancel'
                }
              ]
            });
          alert.present();
        });
      });

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }
}