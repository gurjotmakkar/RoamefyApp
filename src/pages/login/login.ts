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

  constructor(public navCtrl: NavController, public authData: FirebaseProvider,
    public formBuilder: FormBuilder, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, 
    public viewCtrl: ViewController) {
      this.loginForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['', Validators.compose([Validators.required, PasswordValidator.isValid])]
      });
  }

  loginUser(){
    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
    } else {
      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {
        if (this.authData.afAuth.auth.currentUser.emailVerified == false){
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
          var userID = this.authData.getUserId();
          var configured = false;
          this.afs.collection('users').doc<User>(userID).valueChanges()
          .subscribe(a => {
            configured = a.configured == null ? false : a.configured;
            if(configured == false) {
              this.navCtrl.setRoot(InterestPage);
            }
            else{
              this.navCtrl.setRoot(HomePage);
            }
          })
        }
      }, error => {
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

  goToResetPassword(){
    this.navCtrl.setRoot(ResetPasswordPage);
  }

  createAccount(){
    this.navCtrl.setRoot(SignupPage);
  }

  createProAccount(){
    this.navCtrl.setRoot(SignupProPage);
  }

  ngOnDestroy() {
    //this.viewCtrl.dismiss();
  }

}