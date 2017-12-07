import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { PasswordValidator } from '../../validators/password';
import { HomePage } from '../home/home';
import { InterestPage } from '../interest/interest';

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
    public loadingCtrl: LoadingController, private menu: MenuController) {
      this.menu.swipeEnable(false);
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
          var configured;
          var db = this.authData.getObject()
          .subscribe(x => {
            configured = x.Configured;
            if(configured == false) {
              this.navCtrl.setRoot(InterestPage);
              db.unsubscribe();
            }
            else{
              this.navCtrl.setRoot(HomePage);
              db.unsubscribe();
            }
          });

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
    this.navCtrl.push('ResetPasswordPage');
  }

  createAccount(){
    this.navCtrl.push('SignupPage');
  }

  createProAccount(){
    this.navCtrl.push('SignupProPage');
  }

}