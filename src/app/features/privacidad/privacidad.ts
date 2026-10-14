import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n/i18n.service';

/** Política de privacidad pública, en euskera o castellano (la exige Google para su login). */
@Component({
  selector: 'app-privacidad',
  imports: [RouterLink],
  templateUrl: './privacidad.html',
  styleUrl: './privacidad.scss',
})
export class Privacidad {
  protected readonly idioma = inject(I18n).idioma();
  protected readonly responsable = 'Manex Ormazabal Apalategi';
  protected readonly email = 'multakapp@gmail.com';
}
