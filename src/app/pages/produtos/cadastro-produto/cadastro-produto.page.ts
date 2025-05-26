import { Component } from '@angular/core';
import { SqliteService } from 'src/app/services/sqlite.service';
import { NavController } from '@ionic/angular';
import { Produto } from 'src/app/models/produto';

@Component({
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.page.html',
  styleUrls: ['./cadastro-produto.page.scss'],
  standalone: false
})

export class CadastroProdutoPage {
  produto: Produto = {
    id: 0,
    nome: '',
    valor_venda: 0
  };
  produtos: Produto[] = [];

  constructor(private sqlite: SqliteService, private navCtrl: NavController) { }

  async ngOnInit() {
    this.produtos = await this.sqlite.listarProdutos();
  }

  async salvar() {
    if (!this.produto!.nome || !this.produto!.valor_venda) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const insert = `INSERT INTO produtos (nome, descricao, valor_venda) VALUES (?, ?, ?)`;
    const values = [this.produto!.nome, this.produto!.descricao, this.produto!.valor_venda];
    await this.sqlite.db?.run(insert, values);
    this.navCtrl.back();
  }
}
