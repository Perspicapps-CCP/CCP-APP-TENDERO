import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VisorImagenesDialogComponent } from './visor-imagenes-dialog.component';
import { Producto } from '../../../modules/catalogo/interfaces/productos.interface';

describe('VisorImagenesDialogComponent', () => {
  let component: VisorImagenesDialogComponent;
  let fixture: ComponentFixture<VisorImagenesDialogComponent>;

  // Mock para el producto que se pasará como Input
  const productoMock: Producto = {
    product_name: 'Producto Test',
    product_code: 'TEST-001',
    manufacturer_name: 'Fabricante Test',
    price: 100,
    price_currency: 'USD',
    images: ['image1.jpg', 'image2.jpg'],
    quantity: 1,
    quantity_selected: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VisorImagenesDialogComponent,
        NgbCarouselModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VisorImagenesDialogComponent);
    component = fixture.componentInstance;

    // Asignar el producto mock al input del componente
    component.producto = productoMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have product data set correctly', () => {
    expect(component.producto).toBeDefined();
    expect(component.producto.product_name).toBe('Producto Test');
    expect(component.producto.images.length).toBe(2);
  });
});
