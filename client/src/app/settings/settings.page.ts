import { LoadingController, NavController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { EditUserPage } from '../modals/edit-user/edit-user.page';
import { Plugins } from '@capacitor/core';

const { Network } = Plugins;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public loading: any;
  darkMode = false;
  networkStatus;
  networkStateToast;
  selectedSegment = 'profile';
  chngEmailPrompt;
  chngPwPrompt;
  delAccPrompt;
  chngMsg;
  userEmail;
  userList;
  user;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private theme: ThemeService,
    public alertController: AlertController,
    public toastController: ToastController,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.darkMode = this.theme.darkMode;
    this.loadingCtrl.create({
      translucent: true,
      message: 'Authenticating...'
    }).then((overlay) => {
      this.loading = overlay;
      this.loading.present();
      this.authService.reauthenticate().then((res) => {
        this.user = this.userService.currentUser;
        this.loading.dismiss();
        this.getUserInfo();
      }, (err) => {
        this.loading.dismiss();
        this.navCtrl.navigateRoot('/login');
      });
    });
    this.getNetwork();
  }

  getUserInfo() {
    this.authService.getUserInfo(this.user.user_id).subscribe((res: any) => {
      this.userEmail = res.email;
    });
  }

  async getNetwork() {
    this.networkStatus = await Network.getStatus();
    if (!this.networkStatus.connected) {
      this.presentNetworkToast();
    }
  }

  async presentNetworkToast() {
    this.networkStateToast = await this.toastController.create({
      header: 'You can not edit your settings while you are offline',
      position: 'bottom',
      translucent: true,
      buttons: [
        {
          side: 'start',
          icon: 'warning-outline',
          handler: () => {
          }
        }, {
          text: 'Ok',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    this.networkStateToast.present();
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
    if (ev.detail.value === 'admin' && this.user.roles[0] === 'admin') {
      this.authService.getUserList().subscribe((res: any) => {
        this.userList = res;
      });
    }
  }

  async openModal(user?) {
    const modal = await this.modalController.create({
      component: EditUserPage,
      swipeToClose: true,
      componentProps: {
        'user': user,
      }
    }).then((modal) => {
      modal.present();
      modal.onWillDismiss().then(() => {
        this.authService.getUserList().subscribe((res: any) => {
          this.userList = res;
        });
        this.getUserInfo();
      });
    });
  }

  toggleDarkMode() {
    if (this.theme.darkMode) {
      this.theme.enableLight();
      this.darkMode = this.theme.darkMode;
    } else {
      this.theme.enableDark();
      this.darkMode = this.theme.darkMode;
    }
  }

  async presentChngEmailPrompt() {
    await this.getNetwork()
    if (!this.networkStatus.connected) {
      return;
    }
    this.chngEmailPrompt = await this.alertController.create({
      translucent: true,
      header: 'Change E-mail address',
      subHeader: this.userEmail,
      message: 'New E-mail address:',
      inputs: [
        {
          name: 'newEmail',
          type: 'email',
          placeholder: 'yourEmail@newEmail.com'
        },
      ],
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
            this.changeEmail(data)
            return false;
          }
        }
      ]
    });

    await this.chngEmailPrompt.present();
  }

  async presentChngPwPrompt() {
    await this.getNetwork()
    if (!this.networkStatus.connected) {
      return;
    }
    this.chngPwPrompt = await this.alertController.create({
      translucent: true,
      header: 'Change password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current password'
        }, {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New password'
        }, {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm new password'
        },
      ],
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
            this.changePw(data)
            return false;
          }
        }
      ]
    });

    await this.chngPwPrompt.present();
  }

  async presentDelAccPrompt() {
    this.networkStateToast.dismiss();
    await !this.getNetwork()
    if (!this.networkStatus.connected) {
      return;
    }
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
            this.authService.delAcc(this.user.user_id);
            this.authService.logout();
          }
        }
      ]
    });
    await this.delAccPrompt.present();
  }

  async presentChngPromptResult() {
    const alert = await this.alertController.create({
      translucent: true,
      header: 'Changing user credentials...',
      message: this.chngMsg,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }

  changeEmail(data) {
    this.authService.validateEmail(data.newEmail).subscribe((res: any) => {
      if (res.ok) {
        this.authService.changeEmail(data.newEmail).subscribe((res: any) => {
          if (res.ok) {
            this.chngMsg = '<div class="sucChngCredMsg"><ion-icon name="thumbs-up-outline"></ion-icon><br>Verification E-mail has been sent to ' + data.newEmail + '</div>';
            this.presentChngPromptResult();
            this.chngEmailPrompt.dismiss();
          }
        }, (err) => {
          console.log(err);
        });
      }
    }, (err) => {
      if (data.newEmail) {
        this.chngMsg = '<div class="errChngCredMsg"><ion-icon name="warning-outline"></ion-icon><br>You can not use ' + data.newEmail + '</div>';
      } else {
        this.chngMsg = '<div class="errChngCredMsg"><ion-icon name="warning-outline"></ion-icon><br>Please enter an E-mail address</div>';
      }
      this.presentChngPromptResult();
    });
  }

  changePw(data) {
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      this.chngMsg = '<div class="errChngCredMsg"><ion-icon name="warning-outline"></ion-icon><br>Please fill out all fields</div>';
      this.presentChngPromptResult();
    } else if (data.confirmPassword === data.newPassword) {
      this.authService.changePassword(data).subscribe((res: any) => {
        if (res.success) {
          this.chngMsg = '<div class="sucChngCredMsg"><ion-icon name="thumbs-up-outline"></ion-icon><br>Password has been changed</div>';
          this.presentChngPromptResult();
          this.chngPwPrompt.dismiss();
        }
      }, (err) => {
        this.chngMsg = '<div class="errChngCredMsg"><ion-icon name="warning-outline"></ion-icon><br>The current password you supplied is incorrect</div>';
        this.presentChngPromptResult();
        // console.log(err);
      });
    } else if (data.confirmPassword !== data.newPassword) {
      this.chngMsg = '<div class="errChngCredMsg"><ion-icon name="warning-outline"></ion-icon><br>New password and confirm password do not match</div>';
      this.presentChngPromptResult();
    };
  }

}
