import { Component, Input } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Producto } from '../../../modules/catalogo/interfaces/productos.interface';

@Component({
  selector: 'app-visor-imagenes',
  imports: [NgbCarouselModule, TranslateModule],
  templateUrl: './visor-imagenes-dialog.component.html',
  styleUrl: './visor-imagenes-dialog.component.scss',
})
export class VisorImagenesDialogComponent {
  @Input({
    required: true,
  })
  producto!: Producto;
}
