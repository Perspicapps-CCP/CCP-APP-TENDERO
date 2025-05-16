import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { MatCardModule } from '@angular/material/card';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { map, Observable, startWith } from 'rxjs';
import { DinamicSearchService } from '../../../../shared/services/dinamic-search.service';
import { LoginService } from '../../../auth/servicios/login.service';
import { Entrega } from '../../interfaces/entregas.interface';
import { EntregasService } from '../../servicios/entregas.service';

@Component({
  selector: 'app-entregas',
  templateUrl: './entregas.component.html',
  styleUrls: ['./entregas.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonButton,
    sharedImports,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    MatCardModule,
    HighlightTextPipe,
  ],
})
export class EntregasComponent implements ViewWillEnter {
  formBusquedaEntregas = new FormControl('');
  entregas: Entrega[] = [];
  filterEntregas$?: Observable<Entrega[]>;

  constructor(
    private entregasService: EntregasService,
    private dinamicSearchService: DinamicSearchService,
    private loginService: LoginService,
  ) {}

  getDeliveries() {
    console.log('Entra...');
    this.entregasService.getDeliveries().subscribe(clientes => {
      this.entregas = clientes;
      this.filterEntregas();
    });
  }

  filterEntregas() {
    this.filterEntregas$ = this.formBusquedaEntregas.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.entregas, name);
    }
    return this.entregas.slice();
  }

  cerrarSesion() {
    this.loginService.cerrarSesion();
  }

  ionViewWillEnter(): void {
    this.getDeliveries();
  }
}
