import { Component } from '@angular/core';
import { SqliteService } from './services/sqlite.service';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private sqlite: SqliteService) {
    this.initializeApp();
    this.configureStatusBar();
  }

  async initializeApp() {
    await this.sqlite.initDb();
  }

  async configureStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Dark }); // ou Style.Light
      await StatusBar.setBackgroundColor({ color: '#cc0000' }); // mesma cor do header
    } catch (error) {
      console.warn('StatusBar not available on this platform.');
    }
  }
}
