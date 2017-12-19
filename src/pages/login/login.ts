import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController, MenuController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { PasswordValidator } from '../../validators/password';
import { InterestPage } from '../interest/interest';
import { TabsPage } from '../tabs/tabs';
import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';

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
    public loadingCtrl: LoadingController, private menu: MenuController,
    private afs: AngularFirestore) {
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
          var configured;
          this.afs.collection('users').doc<User>(userID).valueChanges()
          .subscribe(a => {
            configured = a.configured;
          })
            if(configured == false) {
              this.navCtrl.setRoot(InterestPage);
            }
            else{
              this.navCtrl.setRoot(TabsPage);
            }

          this.navCtrl.setRoot(TabsPage);
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
    this.navCtrl.setRoot('ResetPasswordPage');
  }

  createAccount(){
    this.navCtrl.setRoot('SignupPage');
  }

  createProAccount(){
    this.navCtrl.setRoot('SignupProPage');
  }

}