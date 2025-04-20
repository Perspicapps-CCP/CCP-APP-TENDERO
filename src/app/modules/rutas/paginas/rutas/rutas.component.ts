import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  imports: [sharedImports, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class RutasComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
