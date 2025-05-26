import { Component } from '@angular/core';
import { SqliteService } from './services/sqlite.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private sqlite: SqliteService,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.sqlite.initDb();

    // Configura a status bar apenas em dispositivos móveis
    if (this.platform.is('capacitor')) {
      await this.configureStatusBar();
    }
  }

  async configureStatusBar() {
    try {
      // Define o estilo da status bar
      await StatusBar.setStyle({ style: Style.Light }); // Use Light se o header for escuro

      // Define a cor de fundo da status bar (mesma cor do seu header)
      await StatusBar.setBackgroundColor({ color: '#cc0000' });

      // IMPORTANTE: Define que a status bar não deve sobrepor o conteúdo
      await StatusBar.setOverlaysWebView({ overlay: false });

      // Mostra a status bar caso esteja oculta
      await StatusBar.show();

    } catch (error) {
      console.warn('StatusBar not available on this platform:', error);
    }
  }
}