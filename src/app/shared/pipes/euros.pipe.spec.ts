import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EurosPipe } from './euros.pipe';

describe('EurosPipe', () => {
  let pipe: EurosPipe;

  beforeEach(() => {
    registerLocaleData(localeEs);
    TestBed.configureTestingModule({
      providers: [EurosPipe, { provide: LOCALE_ID, useValue: 'es-ES' }],
    });
    pipe = TestBed.inject(EurosPipe);
  });

  it('formatea céntimos como euros en español', () => {
    expect(pipe.transform(1250)).toMatch(/^12,50\s€$/);
    expect(pipe.transform(5)).toMatch(/^0,05\s€$/);
    expect(pipe.transform(123456)).toMatch(/^1\.234,56\s€$/);
  });

  it('muestra saldos negativos', () => {
    expect(pipe.transform(-300)).toMatch(/^-3,00\s€$/);
  });

  it('devuelve vacío sin importe', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
