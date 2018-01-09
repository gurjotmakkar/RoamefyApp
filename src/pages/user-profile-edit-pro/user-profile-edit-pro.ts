import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { EmailValidator } from '../../validators/email';
import { UserProfilePage } from '../user-profile/user-profile'
import { AngularFirestore } from 'angularfire2/firestore';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { LoginPage } from '../login/login';
import { NavParams } from 'ionic-angular/navigation/nav-params';

interface UserPro {
  role: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  driverLicenceNumber: string;
  phoneNumber: number;
}

interface User {
  role: string;
  firstName: string;
  lastName: string;
}

@IonicPage()
@Component({
  selector: 'page-user-profile-edit-pro',
  templateUrl: 'user-profile-edit-pro.html',
})
export class UserProfileEditProPage {

  public editForm:FormGroup;
  public loading:Loading;
  public submitAttempt;
  public userEmail;
  switch: boolean = false;

  constructor(public nav: NavController, public authData: FirebaseProvider, public formBuilder: FormBuilder, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, private firebase: FirebaseProvider,
    private afs: AngularFirestore, private modalCtrl: ModalController, public navParams: NavParams) {
    
    this.switch = this.navParams.get('switch');

    this.userEmail = this.firebase.getUserEmail();

    this.editForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      address: ['', Validators.compose([Validators.required])],
      dateOfBirth: ['', Validators.compose([Validators.required, Validators.pattern("[0-3][0-9]/[0-1][0-9]/[1-2][0-9]{3}")])],
      driverLicenceNumber: ['', Validators.compose([Validators.required, Validators.pattern("[0-9a-zA-Z]{15}")])],
      phoneNumber: ['', Validators.compose([Validators.required, Validators.pattern("[0-9]{10}"), Validators.maxLength(10)])]
    });

    var userID = this.firebase.getUserId();
    if (this.switch){
      this.afs.collection('users').doc<User>(userID).valueChanges()
      .subscribe(a => {
        this.editForm.setValue({
          firstName: a.firstName,
          lastName: a.lastName,
          email: this.firebase.getUserEmail(),
          address: '',
          dateOfBirth: '',
          driverLicenceNumber: '',
          phoneNumber: 0
        });
      })
    } else {
      this.afs.collection('users').doc<UserPro>(userID).valueChanges()
      .subscribe(a => {
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

  }
  
  cancel(){
    this.nav.setRoot(UserProfilePage);
  }

  isItSwitch(){
    return this.switch;
  }

  editUserProfile(){
    this.submitAttempt = true;
    if (!this.editForm.valid){
      console.log(this.editForm.value);
    } else {
      if (this.switch){
        this.authData.switchToPro(this.editForm.value.address, this.editForm.value.dateOfBirth,
          this.editForm.value.driverLicenceNumber, this.editForm.value.phoneNumber);
        this.nav.setRoot(UserProfilePage);
      } else {
        this.authData.editUserProfilePro(this.editForm.value.email, this.editForm.value.firstName, 
          this.editForm.value.lastName, this.editForm.value.address, this.editForm.value.dateOfBirth,
          this.editForm.value.driverLicenceNumber, this.editForm.value.phoneNumber)
        if(this.editForm.value.email == this.userEmail)
          this.nav.setRoot(UserProfilePage);
        else
          this.nav.setRoot(LoginPage);
      }
    }
  }

  showAddressModal(){
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      this.editForm.controls['address'].setValue(data === undefined ? null : data.description)
    });
    modal.present();
  }


}
