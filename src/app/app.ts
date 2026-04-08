import { Component, signal } from '@angular/core';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('HR-Management-System');

  constructor(public authService: Auth) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.loggedInSignal.set(true);
    } else {
      this.authService.loggedInSignal.set(false);
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
