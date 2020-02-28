import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { LoadingController, NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public loading: any;
  darkMode = false;
  selectedSegment = 'profile';
  chngEmailPrompt;
  chngMsg;
  user;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private theme: ThemeService,
    public alertController: AlertController
  ) { }

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
        console.log(this.user)
        this.loading.dismiss();
      }, (err) => {
        this.loading.dismiss();
        this.navCtrl.navigateRoot('/login');
      });
    });
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
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
    this.chngEmailPrompt = await this.alertController.create({
      translucent: true,
      header: 'Change E-mail address',
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

  async presentChngPromptResult() {
    const alert = await this.alertController.create({
      translucent: true,
      header: 'Changing user credentials...',
      message: this.chngMsg,
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
        this.chngMsg = '<span class="sucChngCredMsg"><br><br>Verification E-mail has been sent to "' + data.newEmail + '"<br><br></span>';
        this.presentChngPromptResult();
        this.chngEmailPrompt.dismiss();
      }
    }, (err) => {
      if (data.newEmail) {
        this.chngMsg = '<span class="errChngCredMsg"><br><br>You can not use "' + data.newEmail + '"<br><br></span>';
      } else {
        this.chngMsg = '<span class="errChngCredMsg"><br><br>Please enter an E-mail address<br><br></span>';
      }
      this.presentChngPromptResult();
    });
  }

}
