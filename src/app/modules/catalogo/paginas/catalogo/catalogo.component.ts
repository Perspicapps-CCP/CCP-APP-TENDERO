import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
  imports: [
    sharedImports,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
    MatCard,
    ReactiveFormsModule,
    HighlightTextPipe,
  ],
})
export class CatalogoComponent {
  constructor() {}
}
