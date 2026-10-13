import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Política de privacidad pública (la exige Google para el login con Google). */
@Component({
  selector: 'app-privacidad',
  imports: [RouterLink],
  templateUrl: './privacidad.html',
  styleUrl: './privacidad.scss',
})
export class Privacidad {
  protected readonly responsable = 'Manex Ormazabal Apalategi';
  protected readonly email = 'multakapp@gmail.com';
  protected readonly actualizada = '13 de octubre de 2026';
}
