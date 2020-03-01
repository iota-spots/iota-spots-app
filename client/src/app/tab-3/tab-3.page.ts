import { Component, OnInit } from '@angular/core';
import { SharedDocService } from '../services/shared-doc.service';
import { ModalController, LoadingController, NavController, ActionSheetController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { EditDocPage } from '../modals/edit-doc/edit-doc.page';
import { UserService } from '../services/user.service';
import { Map, latLng, tileLayer, Layer, marker } from 'leaflet';


@Component({
  selector: 'app-tab-3',
  templateUrl: './tab-3.page.html',
  styleUrls: ['./tab-3.page.scss'],
})
export class Tab3Page implements OnInit {
  map: Map;

  ionViewDidEnter() { this.leafletMap(); }


  leafletMap() {
    // In setView add latLng and zoom
    this.map = new Map('mapId').setView([52.507657, 13.377921], 13);
    tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: 'edupala.com © ionic LeafLet',
    }).addTo(this.map);


    marker([52.507657, 13.377921]).addTo(this.map)
      .bindPopup('IOTΛ Foundation <br> c/o WeWork')
      .openPopup();
  }

  /** Remove map when we have multiple map object */
  ionViewWillLeave() {
    this.map.remove();
  }

  public sharedDocs: object[] = [];
  public loading: any;
  private user;

  constructor(
    private sharedDocService: SharedDocService,
    private authService: AuthService,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private modalController: ModalController
  ) {
  }


  ngOnInit() {
    this.loadingCtrl.create({
      translucent: true,
      message: 'Authenticating...'
    }).then((overlay) => {
      this.loading = overlay;
      this.loading.present();
      this.authService.reauthenticate().then((res) => {
        this.sharedDocService.init();
        this.sharedDocService.getSharedDocs().subscribe((docs) => {
          this.sharedDocs = docs;
        });
        this.user = this.userService.currentUser;
        this.loading.dismiss();
      }, (err) => {
        this.loading.dismiss();
        this.navCtrl.navigateRoot('/login');
      });
    });
  }

  async openModal(doc?) {
    const modal = await this.modalController.create({
      component: EditDocPage,
      swipeToClose: true,
      componentProps: {
        'doc': doc,
        'db': 'shared'
      }
    }).then((modal) => {
      modal.present();
    });
  }

  async presentActionSheet(doc) {
    let canClick = 'actionSheetButtonInvisible';
    if (doc.author === this.user.user_id || this.user.roles[0] === 'admin') {
      canClick = '';
    }
    const actionSheet = await this.actionSheetController.create({
      translucent: true,
      header: doc.title + ' - ' + doc.type + ' by ' + doc.author,
      buttons: [
        {
          text: 'Edit',
          cssClass: canClick,
          icon: 'pencil',
          handler: () => {
            this.openModal(doc);
          }
        }, {
          text: 'Delete',
          role: 'destructive',
          cssClass: canClick,
          icon: 'trash',
          handler: () => {
            this.presentDeleteConfirm(doc);
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();
  }

  async presentDeleteConfirm(doc) {
    const alert = await this.alertController.create({
      translucent: true,
      header: 'Delete',
      message: 'Do you want to delete <strong>' + doc.title + '</strong> ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Okay',
          handler: () => {
            this.deleteDoc(doc);
          }
        }
      ]
    });
    await alert.present();
  }

  deleteDoc(doc) {
    this.sharedDocService.deleteSharedDoc(doc);
  }

  logout(): void {
    this.authService.logout();
  }


}
