import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.page.html',
  styleUrls: ['./cadastro-produto.page.scss'],
  standalone: false
})

export class CadastroProdutoPage {
  produto = { nome: '', descricao: '', valor_venda: null };

  constructor(private sqlite: SqliteService, private navCtrl: NavController) { }

  async salvar() {
    if (!this.produto.nome || !this.produto.valor_venda) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const insert = `INSERT INTO produtos (nome, descricao, valor_venda) VALUES (?, ?, ?)`;
    const values = [this.produto.nome, this.produto.descricao, this.produto.valor_venda];
    await this.sqlite.db?.run(insert, values);
    this.navCtrl.back();
  }
}
