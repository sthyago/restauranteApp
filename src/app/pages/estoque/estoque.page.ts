import { Component } from '@angular/core';
import { Estoque } from 'src/app/models/estoque';
import { SqliteService } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.scss'],
  standalone: false,
})

export class EstoquePage {
  insumos: Estoque[] = [];
  produtos: { id: number; nome: string }[] = [];


  mostrarFormulario = false;

  constructor(private sqlite: SqliteService) { }

  ionViewWillEnter() {
    this.carregarInsumos();
  }

  async carregarInsumos() {
    this.insumos = await this.sqlite.carregarEstoqueQuery();
  }

  async remover(id: number) {
    if (!confirm('Deseja realmente excluir este item?')) return;

    if (this.sqlite.db) {
      await this.sqlite.db.run(`DELETE FROM estoque WHERE id = ?`, [id]);
      this.carregarInsumos();
    }
  }

}
