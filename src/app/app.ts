import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avisos } from './shared/avisos/avisos';

@Component({
  imports: [RouterOutlet, Avisos],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
