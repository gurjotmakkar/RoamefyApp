import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { PasswordValidator } from '../../validators/password';
import { InterestPage } from '../interest/interest';
import { AngularFirestore } from 'angularfire2/firestore';
import { HomePage } from '../home/home';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { SignupPage } from '../signup/signup';
import { SignupProPage } from '../signup-pro/signup-pro';
import { ViewController } from 'ionic-angular/navigation/view-controller';

interface User {
  configured: boolean;
}

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public loginForm:FormGroup;
  public loading:Loading;
  public submitAttempt;

  constructor(public navCtrl: NavController, public authData: FirebaseProvider,
    public formBuilder: FormBuilder, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, 
    public viewCtrl: ViewController) {
      // build login form with email and password validations
      this.loginForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['', Validators.compose([Validators.required, PasswordValidator.isValid])]
      });
  }

  loginUser(){
    // set submit attempt to true if the user tried to login the first time
    this.submitAttempt = true;
    
    //check if login form was valid
    if (!this.loginForm.valid){

      console.log(this.loginForm.value);

    } else {

      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {
        // check if the email is verified by the user
        // If email is not verified then user will be prompted to verify the email
        if (this.authData.afAuth.auth.currentUser.emailVerified == false && this.authData.afAuth.auth.currentUser.email != 'roamefyapp@gmail.com'){
          this.authData.logoutUser();

          this.loading.dismiss().then( () => {
            let alert = this.alertCtrl.create({
              message: "Please verify your email",
              buttons: [
                {
                  text: "Ok",
                  role: 'cancel'
                }
              ]
            });

            alert.present();
          });

        } else {
          // assign user id
          var userID = this.authData.getUserId();

          var configured = false;

          this.afs.collection('users').doc<User>(userID).valueChanges().take(1)
          .subscribe(a => {

            configured = a.configured == null ? false : a.configured;

            // check if user has already configured interests
            // if not configured then redirected to interest page instead of homepage
            if(configured == false) {
              this.navCtrl.setRoot(InterestPage);
            }
            else{
              this.navCtrl.setRoot(HomePage);
            }
          })
        }
      }, error => {
        // prompt if any error occur
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            message: error.message,
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

  // redirect to passwor page
  goToResetPassword(){
    this.navCtrl.setRoot(ResetPasswordPage);
  }

  // redirect to signup page
  createAccount(){
    this.navCtrl.setRoot(SignupPage);
  }

  // redirect to signup as a pro page
  createProAccount(){
    this.navCtrl.setRoot(SignupProPage);
  }

}