import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { UserProfilePage } from '../user-profile/user-profile'
import { AngularFirestore } from 'angularfire2/firestore';
import { LoginPage } from '../login/login';

interface UserPro {
  role: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  driverLicenceNumber: string;
  phoneNumber: string;
}

@IonicPage()
@Component({
  selector: 'page-user-profile-edit',
  templateUrl: 'user-profile-edit.html',
})
export class UserProfileEditPage {
  public editForm:FormGroup;
  public loading:Loading;
  public submitAttempt;

  constructor(public nav: NavController, public authData: FirebaseProvider, public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, private firebase: FirebaseProvider,
    private afs: AngularFirestore) {
    this.editForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
    });

    var userID = this.firebase.getUserId();
    
    this.afs.collection('users').doc<UserPro>(userID).valueChanges()
    .subscribe(a => {
      this.editForm.setValue({
        firstName: a.firstName,
        lastName: a.lastName,
        email: this.firebase.getUserEmail()
      });
    })

  }
  
  cancel(){
    this.nav.setRoot(UserProfilePage);
  }

  editUserProfile(){
    this.submitAttempt = true;
    if (!this.editForm.valid){
      console.log(this.editForm.value);
    } else {
      this.authData.editUserProfile(this.editForm.value.email, this.editForm.value.firstName, 
        this.editForm.value.lastName)
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
