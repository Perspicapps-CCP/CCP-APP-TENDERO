import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

export const sharedImports = [
  NgbTypeaheadModule,
  CommonModule,
  FormsModule,
  TranslateModule,
  MatIconModule,
  NgbTooltipModule,
];
