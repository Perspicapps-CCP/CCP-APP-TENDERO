import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador para verificar que una fecha no sea menor a la fecha actual
export function noMenorAFechaActual(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Si no hay valor o está vacío, no validamos
    if (!control.value || control.value === '') {
      return null;
    }

    const fechaString = control.value; // Formato "YYYY-MM-DD"

    // Obtenemos los componentes de fecha actual en hora local (Colombia)
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11
    const diaActual = fechaActual.getDate();

    // Convertimos a string formato "YYYY-MM-DD" para comparación neutral a zona horaria
    const fechaActualString = `${anioActual}-${mesActual.toString().padStart(2, '0')}-${diaActual.toString().padStart(2, '0')}`;

    // Comparamos como strings para evitar conversiones de zona horaria
    if (fechaString < fechaActualString) {
      return { fechaPasada: true };
    }

    return null;
  };
}

// Validador para verificar que end_date no sea menor a start_date
export function fechaFinMayorAInicio(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    if (!(formGroup instanceof FormGroup)) {
      return null;
    }

    const group = formGroup as FormGroup;
    const fechaInicio = group.get('start_date')?.value;
    const fechaFin = group.get('end_date')?.value;

    // Si alguna fecha está ausente o vacía, no validamos
    if (!fechaInicio || !fechaFin || fechaInicio === '' || fechaFin === '') {
      return null;
    }

    // Comparamos directamente los strings en formato ISO "YYYY-MM-DD"
    // Esto evita problemas de zona horaria
    if (fechaFin < fechaInicio) {
      // Marcamos específicamente el campo end_date como inválido
      const endDateControl = group.get('end_date');
      if (endDateControl) {
        const currentErrors = endDateControl.errors || {};
        endDateControl.setErrors({ ...currentErrors, fechaFinMenor: true });
      }
      return { fechaFinMenor: true };
    } else {
      // Si la validación es exitosa, quitamos solo este error específico
      const endDateControl = group.get('end_date');
      if (endDateControl && endDateControl.errors) {
        const { fechaFinMenor, ...otherErrors } = endDateControl.errors;
        endDateControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }

    return null;
  };
}
