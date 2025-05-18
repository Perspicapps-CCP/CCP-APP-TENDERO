import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/modules/auth/servicios/login.service';
import { CarritoComprasService } from 'src/app/modules/carrito-compras/servicios/carrito-compras.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  imports: [IonButton, IonButtons, sharedImports, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class PerfilComponent implements ViewWillEnter {
  carritoCount?: Observable<string>;

  constructor(
    private router: Router,
    private carritoComprasService: CarritoComprasService,
    private loginService: LoginService,
  ) {}

  ionViewWillEnter(): void {
    this.carritoCount = this.carritoComprasService.getCartItemCount();
  }

  irCarritoCompras() {
    this.router.navigate([`carrito/carrito-compras`]);
  }

  logout() {
    this.loginService.cerrarSesion();
  }
}
