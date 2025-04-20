import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.component.html',
  styleUrls: ['./visitas.component.scss'],
  standalone: true,
  imports: [sharedImports, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class VisitasComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
