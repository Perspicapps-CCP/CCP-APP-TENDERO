import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Routes, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';

import { LayoutComponent } from './layout.component';

// Definimos algunas rutas de prueba si es necesario
const routes: Routes = [{ path: '', component: LayoutComponent }];

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LayoutComponent],
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'testId',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
