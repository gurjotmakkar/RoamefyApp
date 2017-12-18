import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { LoginPage } from '../login/login';
import { EmailValidator } from '../../validators/email';
import { UserProfilePage } from '../user-profile/user-profile'


@IonicPage()
@Component({
  selector: 'page-user-profile-edit',
  templateUrl: 'user-profile-edit.html',
})
export class UserProfileEditPage {
  public editForm:FormGroup;
  public loading:Loading;
  public submitAttempt;
  userRole: boolean;

  constructor(public nav: NavController, public authData: FirebaseProvider, public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, private firebase: FirebaseProvider) {
    this.editForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      address: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(40)])],
      dateOfBirth: ['', Validators.compose([Validators.pattern("[0-9]{2}/[0-9]{2}/[2][0][0-9]{2}")])],
      driverLicenceNumber: ['', Validators.compose([Validators.pattern("[0-9a-zA-Z]{15}")])],
      phoneNumber: ['', Validators.compose([Validators.pattern("[0-9]{10}"), Validators.maxLength(10)])]
    });

    this.userRole = this.firebase.checkUserRole();
  }
  
  cancel(){
    this.nav.setRoot(UserProfilePage)
  }

  isUserPro(){
    return this.userRole;
  }

  editUserProfile(){
    this.submitAttempt = true;
    if (!this.editForm.valid){
      console.log(this.editForm.value);
    } else {
      this.authData.editUserProfile(this.editForm.value.email, this.editForm.value.firstName, 
        this.editForm.value.lastName, this.editForm.value.address, this.editForm.value.dateOfBirth,
         this.editForm.value.driverLicenceNumber, this.editForm.value.phoneNumber)
      .then(() => {
        let alert = this.alertCtrl.create({
          message: "An email has been sent to your new email address to verify the changes",
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
