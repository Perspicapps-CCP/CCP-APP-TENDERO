import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PerfilComponent } from './perfil.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoComprasService } from 'src/app/modules/carrito-compras/servicios/carrito-compras.service';
import { LoginService } from 'src/app/modules/auth/servicios/login.service';
import { Observable, of } from 'rxjs';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

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

// Mock para CarritoComprasService
class MockCarritoComprasService {
  getCartItemCount(): Observable<string> {
    return of('0');
  }
}

// Mock para LoginService
class MockLoginService {
  cerrarSesion() {
    return;
  }
}

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let router: jasmine.SpyObj<Router>;
  let carritoComprasService: MockCarritoComprasService;
  let loginService: MockLoginService;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const carritoComprasServiceMock = new MockCarritoComprasService();
    const loginServiceMock = new MockLoginService();

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        PerfilComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CarritoComprasService, useValue: carritoComprasServiceMock },
        { provide: LoginService, useValue: loginServiceMock },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    carritoComprasService = TestBed.inject(
      CarritoComprasService,
    ) as unknown as MockCarritoComprasService;
    loginService = TestBed.inject(LoginService) as unknown as MockLoginService;

    // Espiamos los métodos de los servicios
    spyOn(carritoComprasService, 'getCartItemCount').and.callThrough();
    spyOn(loginService, 'cerrarSesion').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize carritoCount on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(carritoComprasService.getCartItemCount).toHaveBeenCalled();
    expect(component.carritoCount).toBeDefined();
  });

  it('should navigate to shopping cart when irCarritoCompras is called', () => {
    component.irCarritoCompras();
    expect(router.navigate).toHaveBeenCalledWith([`carrito/carrito-compras`]);
  });

  it('should call cerrarSesion when logout is called', () => {
    component.logout();
    expect(loginService.cerrarSesion).toHaveBeenCalled();
  });
});
