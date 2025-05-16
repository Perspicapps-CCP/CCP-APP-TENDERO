import { ComponentFixture, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of } from 'rxjs';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { EntregasComponent } from './entregas.component';
import { EntregasService } from '../../servicios/entregas.service';
import { Entrega } from '../../interfaces/entregas.interface';

// Clase Mock para TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

// Mock para TranslateService
class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {}
  use(lang: string) {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock para LocalizationService
class MockLocalizationService {
  currentLanguage: string = 'es';

  initializeLanguage() {
    return;
  }

  setLocalization(locale: string) {
    this.currentLanguage = locale;
    return;
  }

  getLocalCurrencyFormat(value: number) {
    return `$ ${value.toFixed(2)}`;
  }

  getLocale() {
    return 'es-CO';
  }

  getCurrencyCode() {
    return 'COP';
  }
}

// Mock para DinamicSearchService
class MockDinamicSearchService {
  dynamicSearch(items: Entrega[], searchTerm: string) {
    if (!searchTerm) return items;
    return items.filter(
      entrega =>
        entrega.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entrega.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entrega.status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }
}

describe('EntregasComponent', () => {
  let component: EntregasComponent;
  let fixture: ComponentFixture<EntregasComponent>;
  let entregasService: any;
  let dinamicSearchService: DinamicSearchService;
  let router: jasmine.SpyObj<Router>;

  // Mock de datos de entregas
  const mockEntregas: Entrega[] = [
    {
      guide_number: '001',
      address: 'Calle falsa 123',
      status: 'Finalizado',
      delivery_date: '2025-05-12',
      initial_date: 'COMPLETADO',
      phone: '3212599772',
    },
    {
      guide_number: '002',
      address: 'Calle falsa 123',
      status: 'Enrregado',
      delivery_date: '2025-05-12',
      initial_date: 'ESPERA',
      phone: '3212599772',
    },
  ];
  beforeEach(waitForAsync(() => {
    // Crear un servicio mock simple
    const entregasServiceMock = {
      getDeliveries: jasmine.createSpy('getDeliveries').and.returnValue(of(mockEntregas)),
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        MatCardModule,
        EntregasComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: EntregasService, useValue: entregasServiceMock },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: LocalizationService, useClass: MockLocalizationService },
        TranslateStore,
        HighlightTextPipe,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EntregasComponent);
    component = fixture.componentInstance;
    entregasService = TestBed.inject(EntregasService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
