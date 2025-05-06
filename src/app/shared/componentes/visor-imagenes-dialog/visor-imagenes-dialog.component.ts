import { Component, inject, Input, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Producto } from 'src/app/modules/detalle-cliente/interfaces/productos.interface';

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
