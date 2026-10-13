import { formatCurrency } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/** Muestra un importe en céntimos como euros: 1250 → «12,50 €». */
@Pipe({ name: 'euros' })
export class EurosPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(centimos: number | null | undefined): string {
    if (centimos == null) return '';
    return formatCurrency(centimos / 100, this.locale, '€', 'EUR', '1.2-2');
  }
}
