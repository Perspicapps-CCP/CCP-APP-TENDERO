import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { NgxSpinnerModule } from 'ngx-spinner';
import { LocalizationService } from './shared/services/localization.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NgxSpinnerModule],
  standalone: true,
})
export class AppComponent {
  constructor(private localizationService: LocalizationService) {}
}
