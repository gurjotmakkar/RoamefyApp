import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { UserProfilePage } from '../user-profile/user-profile'
import { AngularFirestore } from 'angularfire2/firestore';
import { AutocompletePage } from '../autocomplete/autocomplete';

interface User {
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
  userRole: string;
  address: any;

  constructor(public nav: NavController, public authData: FirebaseProvider, public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, private firebase: FirebaseProvider,
    private afs: AngularFirestore, private modalCtrl: ModalController) {
    this.editForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      address: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(40)])],
      dateOfBirth: ['', Validators.compose([Validators.pattern("[0-9]{2}/[0-9]{2}/[2][0][0-9]{2}")])],
      driverLicenceNumber: ['', Validators.compose([Validators.pattern("[0-9a-zA-Z]{15}")])],
      phoneNumber: ['', Validators.compose([Validators.pattern("[0-9]{10}"), Validators.maxLength(10)])]
    });

    var userID = this.firebase.getUserId();
    this.afs.collection('users').doc<User>(userID).valueChanges()
    .subscribe(a => {
      this.userRole = a.role;
      this.editForm.setValue({
        firstName: a.firstName,
        lastName: a.lastName,
        email: this.firebase.getUserEmail(),
        address: a.address,
        dateOfBirth: a.dateOfBirth,
        driverLicenceNumber: a.driverLicenceNumber,
        phoneNumber: a.phoneNumber
      });
    })

  }
  
  cancel(){
    this.nav.setRoot(UserProfilePage);
  }

  isUserPro(){
    if ( this.userRole == "pro")
      return true;
    return false;
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

  showAddressModal(){
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      this.editForm.setValue({
        address: data.description
      });
    });
    modal.present();
  }

}
