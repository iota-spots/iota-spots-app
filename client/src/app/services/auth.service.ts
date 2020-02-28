import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { UserService } from './user.service';
import { DataService } from './data.service';
import { SERVER_ADDRESS } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private dataService: DataService,
    private navCtrl: NavController,
    private zone: NgZone
  ) { }

  authenticate(credentials) {
    return this.http.post(SERVER_ADDRESS + 'auth/login', credentials);
  }

  logout() {
    const headers = new HttpHeaders();
    headers.append('Authorization', 'Bearer ' + this.userService.currentUser.token + ':' + this.userService.currentUser.password);
    this.http.post(SERVER_ADDRESS + 'auth/logout', {}, { headers }).subscribe((res) => { });

    // tslint:disable-next-line: forin
    for (const db in this.dataService.dbs) {
      this.dataService.dbs[db].destroy().then((res) => {
        // console.log(res);
      }
        , (err) => {
          console.log('could not destroy db');
        });
    }
    this.dataService.dbs = null;
    this.userService.saveUserData(null);
    this.navCtrl.navigateRoot('/login');
  }

  register(details) {
    return this.http.post(SERVER_ADDRESS + 'auth/register', details);
  }

  validateUsername(username) {
    return this.http.get(SERVER_ADDRESS + 'auth/validate-username/' + username);
  }

  validateEmail(email) {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get(SERVER_ADDRESS + 'auth/validate-email/' + encodedEmail);
  }

  forgotPassword(email) {
    return this.http.post(SERVER_ADDRESS + 'auth/forgot-password', email);
  }

  resetPassword(details) {
    return this.http.post(SERVER_ADDRESS + 'auth/password-reset', details);
  }

  changeEmail(details) {
    return this.http.post(SERVER_ADDRESS + 'auth/change-email', details);
  }

  changePassword(details) {
    return this.http.post(SERVER_ADDRESS + 'auth/password-change', details);
  }

  reauthenticate() {
    return new Promise((resolve, reject) => {
      if (this.dataService.dbs === null) {
        this.userService.getUserData().then((userData) => {
          if (userData !== null) {
            const now = new Date();
            const expires = new Date(userData.expires);
            if (expires > now) {
              this.userService.currentUser = userData;
              this.zone.runOutsideAngular(() => {
                this.dataService.initDatabase(userData);
              });
              resolve(true);
            } else {
              reject(true);
            }
          } else {
            reject(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }
}
