import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { ellipse, square, triangle } from 'ionicons/icons';
import { MatIconModule } from '@angular/material/icon';
import { IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [IonTabBar, IonTabButton, IonTabs, MatIconModule, IonLabel],
  standalone: true,
})
export class LayoutComponent {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ triangle, ellipse, square });
  }
}
