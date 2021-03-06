import { Component, NgZone, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  failedAttempt = false;
  loading: any;
  loginForm: FormGroup;
  submitted = false;
  errMessage;
  mailConfirmErr;
  mailConfirmed = false;

  constructor(
    private navCtrl: NavController,
    private fb: FormBuilder,
    private authService: AuthService,
    private dataService: DataService,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private zone: NgZone,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: new FormControl('', [
        Validators.required,
      ]),
      password: new FormControl('', [
        Validators.required,
      ]),
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  ngOnInit() {
    this.authService.reauthenticate().then((res) => {
      this.navCtrl.navigateRoot('/home/tab-1');
    }, (err) => {
    });
    // get query Params for confirm email
    this.route.queryParams.subscribe(params => {
      if (params.success) {
        this.mailConfirmed = true;
      } else {
        this.mailConfirmErr = params.error
      }
    });
  }

  hasFormError(formField) {
    if (!this.f[formField].valid && this.submitted) {
      return true;
    }
    return false;
  }

  login(): void {
    this.submitted = true;
    if (this.loginForm.valid) {
      this.loadingCtrl.create({
        translucent: true,
        message: 'Authenticating...'
      }).then((overlay) => {
        this.loading = overlay;
        this.loading.present();
        this.authService.authenticate(this.loginForm.value).subscribe((res: any) => {
          if (typeof (res.token) !== 'undefined') {
            this.failedAttempt = false;
            this.zone.runOutsideAngular(() => {
              this.dataService.initDatabase(res);
            });
            this.userService.saveUserData(res);
            this.loading.dismiss().then(() => {
              this.navCtrl.navigateRoot('/home/tab-1');
            });
          }
        }, (err) => {
          this.loading.dismiss();
          this.failedAttempt = true;
          this.errMessage = err.error.message;
        });
      });
    }
  }
}
