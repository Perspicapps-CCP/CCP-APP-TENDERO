import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { BehaviorSubject } from 'rxjs';
import { LocalizationService } from './shared/services/localization.service';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NgxSpinnerModule } from 'ngx-spinner';
import { provideLocationMocks } from '@angular/common/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<Record<string, string>>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() {
    return 'es-ES';
  }
  getLang() {
    return 'es';
  }
  getCurrencyCode() {
    return 'EUR';
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, IonApp, IonRouterOutlet, NgxSpinnerModule],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: LocalizationService, useClass: MockLocalizationService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Esto ayuda con elementos personalizados de Ionic
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
