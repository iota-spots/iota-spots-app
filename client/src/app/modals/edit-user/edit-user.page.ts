import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, LoadingController, NavController, AlertController } from '@ionic/angular';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {

  submitted = false;
  submitMsg;
  user: any = false;
  delAccPrompt;
  loading: any;
  form: FormGroup;
  modalTitel: String = 'Edit user';

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private navCtrl: NavController,
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    public alertController: AlertController,
  ) {
    this.form = this.fb.group({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      role: new FormControl('', [
        Validators.required,
      ]),
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  ngOnInit() {
    this.loadingCtrl.create({
      translucent: true,
      message: 'Authenticating...'
    }).then((overlay) => {
      this.loading = overlay;
      this.loading.present();
      this.authService.reauthenticate().then((res) => {
        this.loading.dismiss();
      }), (err) => {
        this.loading.dismiss();
        this.navCtrl.navigateRoot('/login');
      }
    });
    this.user = this.navParams.get('user');
    this.form.patchValue({
      email: this.user.email,
      role: this.user.role
    })
    this.modalTitel = 'Edit ' + this.user._id;
  }

  // update userdoc
  saveUser() {
    this.submitted = true;
    if (this.form.valid) {
      this.form.value.user_id = this.user._id;
      this.authService.editUser(this.form.value).subscribe((res: any) => {
        if(res.ok) {
          this.submitMsg = 'User has been edited successfully';
        }
      }, (err) => {
        this.submitMsg = err;
      });
    }
  }


  async deleteUser() {
    this.delAccPrompt = await this.alertController.create({
      translucent: true,
      header: 'Are you sure you want to delete your Account?',
      subHeader: 'This process cannot be undone',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            // console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: data => {
            this.authService.delAcc(this.user._id);
            this.close();
          }
        }
      ]
    });
    await this.delAccPrompt.present();
  }

  hasFormError(formField) {
    if (!this.f[formField].valid && this.submitted) {
      return true;
    }
    return false;
  }

  resetForm(form: FormGroup) {
    form.reset();
    this.submitted = false;
    Object.keys(form.controls).forEach(key => {
      form.get(key).setErrors(null);
    });
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

}