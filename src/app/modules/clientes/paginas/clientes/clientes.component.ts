import { Component, OnInit } from '@angular/core';
import { IonHeader, IonContent, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  standalone: true,
  imports: [sharedImports, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class ClientesComponent {
  constructor() {}
}
