import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-listar-clientes',
  templateUrl: './listar-clientes.page.html',
  styleUrls: ['./listar-clientes.page.scss'],
  standalone: false
})

export class ListarClientesPage {
  clientes: { id: number; nome: string; telefone?: string; email?: string }[] = [];

  constructor(private sqliteService: SqliteService) { }

  async ionViewWillEnter() {
    this.clientes = await this.sqliteService.listarClientesDetalhados();
  }
}
