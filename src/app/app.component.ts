import { Component } from '@angular/core';
import { SqliteService } from './services/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private sqlite: SqliteService) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.sqlite.initDb();
  }
}
